import { usePrisma } from '../database'
import SubEventRsvp from '../entities/SubEventRsvp'

export default class SubEventRsvpRepository {
  static async upsert(subEventId, guestEmail, status) {
    const prisma = usePrisma()
    const row = await prisma.subEventRsvp.upsert({
      where: {
        subEventId_guestEmail: { subEventId, guestEmail },
      },
      update: { status, updatedAt: new Date() },
      create: { subEventId, guestEmail, status },
    })
    return SubEventRsvp.fromJSON(row)
  }

  static async findBySubEventId(subEventId) {
    const prisma = usePrisma()
    const rows = await prisma.subEventRsvp.findMany({
      where: { subEventId },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => SubEventRsvp.fromJSON(row))
  }

  static async findByEventIdAndEmail(eventId, email) {
    const prisma = usePrisma()
    const rows = await prisma.subEventRsvp.findMany({
      where: {
        guestEmail: email,
        subEvent: { eventId },
      },
      include: { subEvent: { select: { id: true, title: true } } },
    })
    return rows.map((row) => ({
      ...SubEventRsvp.fromJSON(row).toJSON(),
      subEventTitle: row.subEvent.title,
    }))
  }

  static async getCountsBySubEventId(subEventId) {
    const prisma = usePrisma()
    const [accepted, declined, pending] = await Promise.all([
      prisma.subEventRsvp.count({ where: { subEventId, status: 'accepted' } }),
      prisma.subEventRsvp.count({ where: { subEventId, status: 'declined' } }),
      prisma.subEventRsvp.count({ where: { subEventId, status: 'pending' } }),
    ])
    return { accepted, declined, pending }
  }
}
