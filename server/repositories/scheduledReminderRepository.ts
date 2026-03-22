import { usePrisma } from '../database'
import ScheduledReminder from '../entities/ScheduledReminder'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export default class ScheduledReminderRepository {
  static async create(reminder: ScheduledReminder): Promise<ScheduledReminder> {
    const prisma = usePrisma()
    const row = await prisma.scheduledReminder.create({
      data: {
        eventId: toInt(reminder.eventId),
        type: reminder.type,
        scheduledFor: new Date(reminder.scheduledFor),
        metadata: reminder.metadata ? JSON.parse(JSON.stringify(reminder.metadata)) : undefined,
      },
    })
    return ScheduledReminder.fromJSON(row as any)
  }

  static async findDue(): Promise<ScheduledReminder[]> {
    const prisma = usePrisma()
    const rows = await prisma.scheduledReminder.findMany({
      where: {
        scheduledFor: { lte: new Date() },
        sentAt: null,
      },
      orderBy: { scheduledFor: 'asc' },
    })
    return rows.map((row: any) => ScheduledReminder.fromJSON(row))
  }

  static async markSent(id: number): Promise<void> {
    const prisma = usePrisma()
    await prisma.scheduledReminder.update({
      where: { id: toInt(id) },
      data: { sentAt: new Date() },
    })
  }

  static async findByEventId(eventId: number): Promise<ScheduledReminder[]> {
    const prisma = usePrisma()
    const rows = await prisma.scheduledReminder.findMany({
      where: { eventId: toInt(eventId) },
      orderBy: { scheduledFor: 'asc' },
    })
    return rows.map((row: any) => ScheduledReminder.fromJSON(row))
  }

  static async deleteByEventId(eventId: number): Promise<void> {
    const prisma = usePrisma()
    await prisma.scheduledReminder.deleteMany({
      where: { eventId: toInt(eventId), sentAt: null },
    })
  }
}
