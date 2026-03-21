import { usePrisma } from '../database'
import ActivityLog from '../entities/ActivityLog'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export default class ActivityLogRepository {
  static async create(log: ActivityLog): Promise<ActivityLog> {
    const prisma = usePrisma()
    const row = await prisma.activityLog.create({
      data: {
        eventId: toInt(log.eventId),
        type: log.type,
        actorName: log.actorName,
        actorEmail: log.actorEmail,
        metadata: log.metadata ? JSON.parse(JSON.stringify(log.metadata)) : undefined,
      },
    })
    return ActivityLog.fromJSON(row as any)
  }

  static async findByEventId(eventId: string | number, limit: number = 20): Promise<ActivityLog[]> {
    const prisma = usePrisma()
    const rows = await prisma.activityLog.findMany({
      where: { eventId: toInt(eventId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return rows.map((row) => ActivityLog.fromJSON(row as any))
  }

  static async findByEventIds(eventIds: number[], limit: number = 10): Promise<ActivityLog[]> {
    if (eventIds.length === 0) return []
    const prisma = usePrisma()
    const rows = await prisma.activityLog.findMany({
      where: { eventId: { in: eventIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { event: { select: { title: true } } },
    })
    return rows.map((row) => {
      const log = ActivityLog.fromJSON(row as any)
      // Attach event title to metadata for display
      log.metadata = { ...log.metadata, eventTitle: (row as any).event?.title }
      return log
    })
  }
}
