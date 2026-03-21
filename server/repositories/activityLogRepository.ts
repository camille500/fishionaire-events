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
        metadata: log.metadata || undefined,
      },
    })
    return ActivityLog.fromJSON(row)
  }

  static async findByEventId(eventId: string | number, limit: number = 20): Promise<ActivityLog[]> {
    const prisma = usePrisma()
    const rows = await prisma.activityLog.findMany({
      where: { eventId: toInt(eventId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return rows.map((row) => ActivityLog.fromJSON(row))
  }
}
