import NotificationRepository from '../repositories/notificationRepository'
import NotificationPreferenceRepository from '../repositories/notificationPreferenceRepository'
import ScheduledReminderRepository from '../repositories/scheduledReminderRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import Notification from '../entities/Notification'
import ScheduledReminder from '../entities/ScheduledReminder'
import type { NotificationData } from '../entities/Notification'
import type { NotificationPreferenceData, CategoryPreference } from '../entities/NotificationPreference'
import { sendEmail } from '../utils/email'
import { renderEventReminderEmail, renderRsvpNudgeEmail } from '../utils/emailTemplates'

const NOTIFICATION_TYPE_CATEGORY: Record<string, string> = {
  rsvp_update: 'rsvp_updates',
  wishlist_claim: 'wishlist_activity',
  wishlist_purchase: 'wishlist_activity',
  date_poll_vote: 'guest_activity',
  music_request: 'guest_activity',
  dietary: 'guest_activity',
  plus_one: 'guest_activity',
  co_organizer_added: 'rsvp_updates',
  photo_upload: 'guest_activity',
  event_update: 'event_reminders',
  event_reminder: 'event_reminders',
  rsvp_nudge: 'event_reminders',
  system: 'system_announcements',
}

const NOTIFICATION_TIER_REQUIRED: Record<string, string> = {
  rsvp_update: 'free',
  event_update: 'free',
  system: 'free',
  wishlist_claim: 'standard',
  wishlist_purchase: 'standard',
  date_poll_vote: 'standard',
  music_request: 'standard',
  dietary: 'standard',
  plus_one: 'standard',
  co_organizer_added: 'standard',
  photo_upload: 'standard',
  event_reminder: 'standard',
  rsvp_nudge: 'pro',
}

const TIER_ORDER: Record<string, number> = { free: 0, standard: 1, pro: 2 }

const DEFAULT_PREFERENCES: Record<string, CategoryPreference> = {
  event_reminders: { inApp: true, email: true },
  rsvp_updates: { inApp: true, email: true },
  wishlist_activity: { inApp: true, email: false },
  guest_activity: { inApp: true, email: false },
  system_announcements: { inApp: true, email: false },
}

interface NotifyParams {
  eventId: number
  type: string
  title: string
  body: string
  linkUrl?: string
  metadata?: Record<string, unknown>
  recipientClerkIds?: string[]
  recipientRole?: 'owner' | 'co_organizer' | 'all_organizers'
  eventTier?: string
}

export default class NotificationController {
  static async getForUser(
    clerkId: string,
    opts: { limit?: number, offset?: number, unreadOnly?: boolean } = {},
  ): Promise<{ notifications: NotificationData[], unreadCount: number }> {
    const [notifications, unreadCount] = await Promise.all([
      NotificationRepository.findByUserId(clerkId, opts),
      NotificationRepository.countUnread(clerkId),
    ])
    return {
      notifications: notifications.map((n) => n.toJSON()),
      unreadCount,
    }
  }

  static async getUnreadCount(clerkId: string): Promise<number> {
    return NotificationRepository.countUnread(clerkId)
  }

  static async markRead(notificationId: number, clerkId: string): Promise<void> {
    await NotificationRepository.markAsRead(notificationId, clerkId)
  }

  static async markAllRead(clerkId: string): Promise<void> {
    await NotificationRepository.markAllAsRead(clerkId)
  }

  static async getPreferences(clerkId: string): Promise<NotificationPreferenceData> {
    const existing = await NotificationPreferenceRepository.findByUserId(clerkId)
    if (existing) {
      const merged = { ...DEFAULT_PREFERENCES, ...existing.preferences }
      return { ...existing.toJSON(), preferences: merged }
    }
    return {
      id: null,
      userClerkId: clerkId,
      preferences: { ...DEFAULT_PREFERENCES },
      reminderSchedule: ['24h', '3d'],
      digestEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  static async updatePreferences(
    clerkId: string,
    data: Partial<NotificationPreferenceData>,
  ): Promise<NotificationPreferenceData> {
    const updated = await NotificationPreferenceRepository.upsert(clerkId, data)
    return updated.toJSON()
  }

  static async notify(params: NotifyParams): Promise<void> {
    try {
      const {
        eventId, type, title, body, linkUrl, metadata,
        recipientClerkIds, recipientRole, eventTier,
      } = params

      const tier = eventTier || 'free'
      const requiredTier = NOTIFICATION_TIER_REQUIRED[type] || 'standard'
      if ((TIER_ORDER[tier] ?? 0) < (TIER_ORDER[requiredTier] ?? 0)) return

      let clerkIds = recipientClerkIds || []
      if (!clerkIds.length && recipientRole) {
        const members = await EventMemberRepository.findByEventId(String(eventId))
        if (recipientRole === 'owner') {
          clerkIds = members.filter((m) => m.isOwner).map((m) => m.userClerkId)
        } else if (recipientRole === 'co_organizer') {
          clerkIds = members.filter((m) => m.isCoOrganizer).map((m) => m.userClerkId)
        } else if (recipientRole === 'all_organizers') {
          clerkIds = members.filter((m) => m.canEdit).map((m) => m.userClerkId)
        }
      }

      if (!clerkIds.length) return

      const category = NOTIFICATION_TYPE_CATEGORY[type] || 'system_announcements'

      for (const clerkId of clerkIds) {
        const prefs = await NotificationPreferenceRepository.findByUserId(clerkId)
        const categoryPrefs = prefs?.preferences?.[category] ?? DEFAULT_PREFERENCES[category] ?? { inApp: true, email: false }

        if (categoryPrefs.inApp) {
          const notification = new Notification({
            id: null,
            userClerkId: clerkId,
            eventId,
            type,
            title,
            body,
            linkUrl: linkUrl || null,
            metadata: metadata || null,
            isRead: false,
            createdAt: new Date(),
          })
          await NotificationRepository.create(notification)
        }

        if (categoryPrefs.email && (TIER_ORDER[tier] ?? 0) >= (TIER_ORDER['standard'] ?? 1)) {
          // Email sending is fire-and-forget to avoid blocking
          const userPrefs = prefs?.toJSON()
          if (userPrefs) {
            // Email will be sent based on the notification type
            // For now, in-app is the primary channel; email templates
            // are handled by specific flows (reminders, RSVP confirmations)
          }
        }
      }
    } catch {
      // Notifications should never block the main flow
    }
  }

  static async scheduleReminders(eventId: number, eventDate: Date): Promise<void> {
    try {
      await ScheduledReminderRepository.deleteByEventId(eventId)

      const windows: Record<string, number> = {
        '24h': 24 * 60 * 60 * 1000,
        '3d': 3 * 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
      }

      const members = await EventMemberRepository.findByEventId(String(eventId))
      const ownerClerkId = members.find((m) => m.isOwner)?.userClerkId
      if (!ownerClerkId) return

      const prefs = await NotificationPreferenceRepository.findByUserId(ownerClerkId)
      const schedule = prefs?.reminderSchedule || ['24h', '3d']

      for (const window of schedule) {
        const ms = windows[window]
        if (!ms) continue
        const scheduledFor = new Date(eventDate.getTime() - ms)
        if (scheduledFor <= new Date()) continue

        const reminder = new ScheduledReminder({
          id: null,
          eventId,
          type: 'event_reminder',
          scheduledFor,
          sentAt: null,
          metadata: { window },
          createdAt: new Date(),
        })
        await ScheduledReminderRepository.create(reminder)
      }

      // Schedule RSVP nudge at 3 days before
      const nudgeDate = new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000)
      if (nudgeDate > new Date()) {
        const nudge = new ScheduledReminder({
          id: null,
          eventId,
          type: 'rsvp_nudge',
          scheduledFor: nudgeDate,
          sentAt: null,
          metadata: null,
          createdAt: new Date(),
        })
        await ScheduledReminderRepository.create(nudge)
      }
    } catch {
      // Reminder scheduling should never block the main flow
    }
  }

  static async processReminders(): Promise<number> {
    const dueReminders = await ScheduledReminderRepository.findDue()
    let processed = 0

    for (const reminder of dueReminders) {
      try {
        const { usePrisma } = await import('../database')
        const prisma = usePrisma()
        const event = await prisma.event.findUnique({
          where: { id: reminder.eventId },
          include: {
            members: { include: { user: true } },
            invitations: true,
          },
        })

        if (!event) {
          await ScheduledReminderRepository.markSent(reminder.id!)
          continue
        }

        const config = useRuntimeConfig()
        const baseUrl = config.public.appUrl || 'http://localhost:3000'

        if (reminder.type === 'event_reminder') {
          const organizers = (event.members as any[]).filter((m: any) => m.role === 'owner' || m.role === 'co_organizer')
          const window = (reminder.metadata as any)?.window || '24h'
          const timeframeMap: Record<string, string> = { '24h': '24 hours', '3d': '3 days', '1w': '1 week' }

          for (const org of organizers) {
            if (!org.user?.email) continue
            const html = renderEventReminderEmail({
              eventTitle: event.title,
              eventDate: event.eventDate?.toISOString() || null,
              eventLocation: event.location || null,
              timeframe: timeframeMap[window] || window,
              dashboardLink: `${baseUrl}/dashboard/events/${event.id}`,
            })
            await sendEmail(org.user.email, `Reminder: ${event.title} is in ${timeframeMap[window] || window}`, html)
          }
        } else if (reminder.type === 'rsvp_nudge') {
          const owner = (event.members as any[]).find((m: any) => m.role === 'owner')
          if (owner?.user?.email) {
            const pendingInvitations = (event.invitations as any[]).filter((i: any) => i.status === 'pending')
            if (pendingInvitations.length > 0) {
              const guestNames = pendingInvitations
                .slice(0, 5)
                .map((i: any) => i.inviteeName || i.inviteeEmail)
              const html = renderRsvpNudgeEmail({
                eventTitle: event.title,
                pendingCount: pendingInvitations.length,
                totalInvited: (event.invitations as any[]).length,
                guestNames,
                dashboardLink: `${baseUrl}/dashboard/events/${event.id}`,
              })
              await sendEmail(owner.user.email, `${pendingInvitations.length} guests haven't responded to ${event.title}`, html)
            }
          }
        }

        await ScheduledReminderRepository.markSent(reminder.id!)
        processed++
      } catch {
        // Skip failed reminders, they'll be retried next cycle
      }
    }

    // Cleanup old notifications
    await NotificationRepository.deleteOlderThan(90)

    return processed
  }
}
