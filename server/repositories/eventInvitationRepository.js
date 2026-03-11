import { eq, and } from 'drizzle-orm'
import { useDatabase } from '../database'
import { eventInvitations } from '../database/schema'
import EventInvitation from '../entities/EventInvitation'

export default class EventInvitationRepository {
  static async create(invitation) {
    const db = useDatabase()
    const data = invitation.toJSON()
    const rows = await db
      .insert(eventInvitations)
      .values({
        eventId: data.eventId,
        inviteeEmail: data.inviteeEmail,
        inviterClerkId: data.inviterClerkId,
        status: data.status,
      })
      .returning()
    return EventInvitation.fromJSON(rows[0])
  }

  static async findByEventId(eventId) {
    const db = useDatabase()
    const rows = await db
      .select()
      .from(eventInvitations)
      .where(eq(eventInvitations.eventId, eventId))
    return rows.map((row) => EventInvitation.fromJSON(row))
  }

  static async findByEventIdAndEmail(eventId, email) {
    const db = useDatabase()
    const rows = await db
      .select()
      .from(eventInvitations)
      .where(
        and(
          eq(eventInvitations.eventId, eventId),
          eq(eventInvitations.inviteeEmail, email)
        )
      )
      .limit(1)
    if (!rows.length) return null
    return EventInvitation.fromJSON(rows[0])
  }
}
