import { usePrisma } from '../database'
import EventInvitation from '../entities/EventInvitation'

export default class EventInvitationRepository {
  static async create(invitation: EventInvitation): Promise<EventInvitation> {
    const prisma = usePrisma()
    const data = invitation.toJSON()
    const row = await prisma.eventInvitation.create({
      data: {
        eventId: data.eventId,
        inviteeEmail: data.inviteeEmail,
        inviterClerkId: data.inviterClerkId,
        status: data.status,
      },
    })
    return EventInvitation.fromJSON(row)
  }

  static async findByEventId(eventId: string): Promise<EventInvitation[]> {
    const prisma = usePrisma()
    const rows = await prisma.eventInvitation.findMany({ where: { eventId } })
    return rows.map((row) => EventInvitation.fromJSON(row))
  }

  static async findByEventIdAndEmail(eventId: string, email: string): Promise<EventInvitation | null> {
    const prisma = usePrisma()
    const row = await prisma.eventInvitation.findFirst({
      where: { eventId, inviteeEmail: email },
    })
    if (!row) return null
    return EventInvitation.fromJSON(row)
  }
}
