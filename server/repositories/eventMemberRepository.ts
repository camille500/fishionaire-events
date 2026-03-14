import { usePrisma } from '../database'
import EventMember from '../entities/EventMember'

export default class EventMemberRepository {
  static async create(member) {
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

  static async findByEventId(eventId) {
    const prisma = usePrisma()
    const rows = await prisma.eventMember.findMany({
      where: { eventId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => EventMember.fromJSON(row))
  }

  static async findByEventIdAndUserId(eventId, clerkId) {
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

  static async findCoOrganizedEvents(clerkId) {
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

  static async delete(eventId, userClerkId) {
    const prisma = usePrisma()
    await prisma.eventMember.delete({
      where: {
        eventId_userClerkId: { eventId, userClerkId },
      },
    })
  }
}
