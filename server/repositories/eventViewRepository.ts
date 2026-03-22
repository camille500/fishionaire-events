import { usePrisma } from '../database'
import EventView from '../entities/EventView'

interface ViewCountByDate {
  date: string
  count: number
}

export default class EventViewRepository {
  static async create(view: EventView): Promise<EventView> {
    const prisma = usePrisma()
    const data = view.toJSON()
    const row = await prisma.eventView.create({
      data: {
        eventId: Number(data.eventId),
        viewerIp: data.viewerIp,
        userAgent: data.userAgent,
        clerkId: data.clerkId,
      },
    })
    return EventView.fromJSON(row)
  }

  static async countByEventId(eventId: string): Promise<number> {
    const prisma = usePrisma()
    return prisma.eventView.count({ where: { eventId: Number(eventId) } })
  }

  static async countGroupedByDate(eventId: string, days: number = 30): Promise<ViewCountByDate[]> {
    const prisma = usePrisma()
    const since = new Date()
    since.setDate(since.getDate() - days)

    const rows = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM event_views
      WHERE event_id = ${Number(eventId)} AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
    return (rows as { date: string, count: number }[]).map((r) => ({ date: r.date, count: r.count }))
  }

  static async countAllGroupedByDate(days: number = 30): Promise<{ date: string, count: number }[]> {
    const prisma = usePrisma()
    const since = new Date()
    since.setDate(since.getDate() - days)

    const rows = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM event_views
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
    return (rows as { date: string, count: number }[]).map((r) => ({ date: r.date, count: r.count }))
  }

  static async hasRecentView(eventId: string, ip: string | null, minutes: number = 5): Promise<boolean> {
    if (!ip) return false
    const prisma = usePrisma()
    const since = new Date()
    since.setMinutes(since.getMinutes() - minutes)

    const count = await prisma.eventView.count({
      where: {
        eventId: Number(eventId),
        viewerIp: ip,
        createdAt: { gte: since },
      },
    })
    return count > 0
  }
}
