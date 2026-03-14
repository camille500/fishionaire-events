import { usePrisma } from '../database'
import SubEventRsvp from '../entities/SubEventRsvp'

interface RsvpWithSubEventTitle extends ReturnType<SubEventRsvp['toJSON']> {
  subEventTitle: string
}

interface RsvpCounts {
  accepted: number
  declined: number
  pending: number
}

export default class SubEventRsvpRepository {
  static async upsert(subEventId: string, guestEmail: string, status: string): Promise<SubEventRsvp> {
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

  static async findBySubEventId(subEventId: string): Promise<SubEventRsvp[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventRsvp.findMany({
      where: { subEventId },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => SubEventRsvp.fromJSON(row))
  }

  static async findByEventIdAndEmail(eventId: string, email: string): Promise<RsvpWithSubEventTitle[]> {
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

  static async getCountsBySubEventId(subEventId: string): Promise<RsvpCounts> {
    const prisma = usePrisma()
    const [accepted, declined, pending] = await Promise.all([
      prisma.subEventRsvp.count({ where: { subEventId, status: 'accepted' } }),
      prisma.subEventRsvp.count({ where: { subEventId, status: 'declined' } }),
      prisma.subEventRsvp.count({ where: { subEventId, status: 'pending' } }),
    ])
    return { accepted, declined, pending }
  }
}
