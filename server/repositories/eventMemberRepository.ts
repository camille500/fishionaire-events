import { usePrisma } from '../database'
import EventMember from '../entities/EventMember'

interface MemberWithEvent {
  member: EventMember
  event: Record<string, unknown>
}

export default class EventMemberRepository {
  static async create(member: EventMember): Promise<EventMember> {
    const prisma = usePrisma()
    const data = member.toJSON()
    const row = await prisma.eventMember.create({
      data: {
        eventId: data.eventId,
        userClerkId: data.userClerkId,
        role: data.role,
        invitedEmail: data.invitedEmail,
      },
      include: { user: true },
    })
    return EventMember.fromJSON(row)
  }

  static async findByEventId(eventId: string): Promise<EventMember[]> {
    const prisma = usePrisma()
    const rows = await prisma.eventMember.findMany({
      where: { eventId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => EventMember.fromJSON(row))
  }

  static async findByEventIdAndUserId(eventId: string, clerkId: string): Promise<EventMember | null> {
    const prisma = usePrisma()
    const row = await prisma.eventMember.findUnique({
      where: {
        eventId_userClerkId: { eventId, userClerkId: clerkId },
      },
      include: { user: true },
    })
    if (!row) return null
    return EventMember.fromJSON(row)
  }

  static async findCoOrganizedEvents(clerkId: string): Promise<MemberWithEvent[]> {
    const prisma = usePrisma()
    const rows = await prisma.eventMember.findMany({
      where: { userClerkId: clerkId, role: 'co_organizer' },
      include: { event: true },
    })
    return rows.map((row) => ({
      member: EventMember.fromJSON(row),
      event: row.event,
    }))
  }

  static async delete(eventId: string, userClerkId: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.eventMember.delete({
      where: {
        eventId_userClerkId: { eventId, userClerkId },
      },
    })
  }
}
