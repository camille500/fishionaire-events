import { eq, desc, sql } from 'drizzle-orm'
import { useDatabase } from '../database'
import { events, eventInvitations } from '../database/schema'
import Event from '../entities/Event'

export default class EventRepository {
  static async create(event) {
    const db = useDatabase()
    const data = event.toJSON()
    const rows = await db
      .insert(events)
      .values({
        title: data.title,
        ownerClerkId: data.ownerClerkId,
      })
      .returning()
    return Event.fromJSON(rows[0])
  }

  static async findByOwner(clerkId) {
    const db = useDatabase()
    const rows = await db
      .select()
      .from(events)
      .where(eq(events.ownerClerkId, clerkId))
      .orderBy(desc(events.createdAt))
    return rows.map((row) => Event.fromJSON(row))
  }

  static async findByInviteeEmail(email) {
    const db = useDatabase()
    const rows = await db
      .select({
        id: events.id,
        title: events.title,
        ownerClerkId: events.ownerClerkId,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        invitationStatus: eventInvitations.status,
      })
      .from(events)
      .innerJoin(eventInvitations, eq(events.id, eventInvitations.eventId))
      .where(eq(eventInvitations.inviteeEmail, email))
      .orderBy(desc(events.createdAt))
    return rows.map((row) => ({
      event: Event.fromJSON(row),
      status: row.invitationStatus,
    }))
  }

  static async getInvitationCount(eventId) {
    const db = useDatabase()
    const rows = await db
      .select({ count: sql`count(*)::int` })
      .from(eventInvitations)
      .where(eq(eventInvitations.eventId, eventId))
    return rows[0]?.count || 0
  }
}
