import EventMember from '../entities/EventMember'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventRepository from '../repositories/eventRepository'
import UserRepository from '../repositories/userRepository'
import NotificationController from './notificationController'

export default class EventMemberController {
  static async addCoOrganizer(eventId: number, ownerClerkId: string, payload: { email?: string, clerkId?: string }): Promise<Record<string, unknown>> {
    if (!payload.clerkId && (!payload.email || !payload.email.trim())) {
      throw createError({ statusCode: 400, statusMessage: 'Email or user ID is required' })
    }

    // Only the owner can add co-organizers
    const ownerMember = await EventMemberRepository.findByEventIdAndUserId(eventId, ownerClerkId)
    if (!ownerMember || !ownerMember.isOwner) {
      throw createError({ statusCode: 403, statusMessage: 'Only the event owner can add co-organizers' })
    }

    // Look up user by clerkId or email
    let user
    if (payload.clerkId) {
      user = await UserRepository.findByClerkId(payload.clerkId)
      if (!user) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
      }
    } else {
      const normalizedEmail = payload.email!.trim().toLowerCase()
      const { users } = await UserRepository.findAll({ search: normalizedEmail, offset: 0, limit: 1 })
      user = users.find((u) => u.email === normalizedEmail) || null
      if (!user) {
        throw createError({ statusCode: 404, statusMessage: 'No user found with this email. They need to sign up first.' })
      }
    }

    if (user.clerkId === ownerClerkId) {
      throw createError({ statusCode: 400, statusMessage: 'You cannot add yourself as a co-organizer' })
    }

    // Check if already a member
    const existing = await EventMemberRepository.findByEventIdAndUserId(eventId, user.clerkId)
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'This person is already a member of this event' })
    }

    const member = new EventMember({
      eventId,
      userClerkId: user.clerkId,
      role: 'co_organizer',
      invitedEmail: user.email,
    })

    const saved = await EventMemberRepository.create(member)

    const event = await EventRepository.findById(eventId)
    NotificationController.notify({
      eventId,
      type: 'co_organizer_added',
      title: 'You were added as co-organizer',
      body: `You were added as a co-organizer for "${event?.title || 'an event'}"`,
      linkUrl: `/dashboard/events/${eventId}`,
      recipientClerkIds: [user.clerkId],
      eventTier: event?.tier,
    })

    return saved.toJSON()
  }

  static async removeCoOrganizer(eventId: number, ownerClerkId: string, targetClerkId: string): Promise<void> {
    const ownerMember = await EventMemberRepository.findByEventIdAndUserId(eventId, ownerClerkId)
    if (!ownerMember || !ownerMember.isOwner) {
      throw createError({ statusCode: 403, statusMessage: 'Only the event owner can remove co-organizers' })
    }

    const target = await EventMemberRepository.findByEventIdAndUserId(eventId, targetClerkId)
    if (!target || target.role !== 'co_organizer') {
      throw createError({ statusCode: 404, statusMessage: 'Co-organizer not found' })
    }

    await EventMemberRepository.delete(eventId, targetClerkId)
  }

  static async listMembers(eventId: number, clerkId: string): Promise<Record<string, unknown>[]> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'Only organizers can view members' })
    }

    const members = await EventMemberRepository.findByEventId(eventId)
    return members.map((m: EventMember) => m.toJSON())
  }
}
