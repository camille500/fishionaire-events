import EventMember from '../entities/EventMember'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventRepository from '../repositories/eventRepository'
import { usePrisma } from '../database'

export default class EventMemberController {
  static async addCoOrganizer(eventId: number, ownerClerkId: string, email: string): Promise<Record<string, unknown>> {
    if (!email || !email.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Only the owner can add co-organizers
    const ownerMember = await EventMemberRepository.findByEventIdAndUserId(eventId, ownerClerkId)
    if (!ownerMember || !ownerMember.isOwner) {
      throw createError({ statusCode: 403, statusMessage: 'Only the event owner can add co-organizers' })
    }

    // Look up user by email
    const prisma = usePrisma()
    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'No user found with this email. They need to sign up first.' })
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
      invitedEmail: normalizedEmail,
    })

    const saved = await EventMemberRepository.create(member)
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
