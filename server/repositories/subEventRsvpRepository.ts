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
        subEventId_guestEmail: { subEventId: Number(subEventId), guestEmail },
      },
      update: { status, updatedAt: new Date() },
      create: { subEventId: Number(subEventId), guestEmail, status },
    })
    return SubEventRsvp.fromJSON(row)
  }

  static async findBySubEventId(subEventId: string): Promise<SubEventRsvp[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventRsvp.findMany({
      where: { subEventId: Number(subEventId) },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => SubEventRsvp.fromJSON(row))
  }

  static async findByEventIdAndEmail(eventId: string, email: string): Promise<RsvpWithSubEventTitle[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventRsvp.findMany({
      where: {
        guestEmail: email,
        subEvent: { eventId: Number(eventId) },
      },
      include: { subEvent: { select: { id: true, title: true } } },
    })
    return rows.map((row) => ({
      ...SubEventRsvp.fromJSON(row).toJSON(),
      subEventTitle: row.subEvent.title,
    }))
  }

  static async findAllByEventId(eventId: string): Promise<SubEventRsvp[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventRsvp.findMany({
      where: { subEvent: { eventId: Number(eventId) } },
      include: { subEvent: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => SubEventRsvp.fromJSON(row))
  }

  static async getCountsByEventId(eventId: string): Promise<Record<number, RsvpCounts>> {
    const prisma = usePrisma()
    const rows = await prisma.subEventRsvp.groupBy({
      by: ['subEventId', 'status'],
      where: { subEvent: { eventId: Number(eventId) } },
      _count: true,
    })
    const counts: Record<number, RsvpCounts> = {}
    for (const row of rows) {
      if (!counts[row.subEventId]) {
        counts[row.subEventId] = { accepted: 0, declined: 0, pending: 0 }
      }
      if (row.status === 'accepted') counts[row.subEventId].accepted = row._count
      else if (row.status === 'declined') counts[row.subEventId].declined = row._count
      else if (row.status === 'pending') counts[row.subEventId].pending = row._count
    }
    return counts
  }

  static async getCountsBySubEventId(subEventId: string): Promise<RsvpCounts> {
    const prisma = usePrisma()
    const [accepted, declined, pending] = await Promise.all([
      prisma.subEventRsvp.count({ where: { subEventId: Number(subEventId), status: 'accepted' } }),
      prisma.subEventRsvp.count({ where: { subEventId: Number(subEventId), status: 'declined' } }),
      prisma.subEventRsvp.count({ where: { subEventId: Number(subEventId), status: 'pending' } }),
    ])
    return { accepted, declined, pending }
  }
}
