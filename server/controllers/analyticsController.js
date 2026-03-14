import EventView from '../entities/EventView'
import EventViewRepository from '../repositories/eventViewRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import { usePrisma } from '../database'

export default class AnalyticsController {
  static async recordView(eventId, { ip, userAgent, clerkId }) {
    // Deduplicate: skip if same IP viewed in last 5 minutes
    const isRecent = await EventViewRepository.hasRecentView(eventId, ip)
    if (isRecent) return null

    const view = new EventView({
      eventId,
      viewerIp: ip || null,
      userAgent: userAgent || null,
      clerkId: clerkId || null,
    })

    return EventViewRepository.create(view)
  }

  static async getEventAnalytics(eventId, clerkId) {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'Only organizers can view analytics' })
    }

    const prisma = usePrisma()

    const [totalViews, viewsOverTime, rsvpCounts, invitationCount] = await Promise.all([
      EventViewRepository.countByEventId(eventId),
      EventViewRepository.countGroupedByDate(eventId, 30),
      prisma.eventInvitation.groupBy({
        by: ['status'],
        where: { eventId },
        _count: true,
      }),
      EventRepository.getInvitationCount(eventId),
    ])

    const rsvpBreakdown = { pending: 0, accepted: 0, declined: 0 }
    rsvpCounts.forEach((r) => {
      rsvpBreakdown[r.status] = r._count
    })

    return {
      totalViews,
      viewsOverTime,
      rsvpBreakdown,
      invitationCount,
      acceptanceRate: invitationCount > 0
        ? Math.round((rsvpBreakdown.accepted / invitationCount) * 100)
        : 0,
    }
  }
}
