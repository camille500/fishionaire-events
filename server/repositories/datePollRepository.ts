import { usePrisma } from '../database'
import DatePoll from '../entities/DatePoll'

export default class DatePollRepository {
  static async findByEventId(eventId: string): Promise<DatePoll | null> {
    const prisma = usePrisma()
    const row = await prisma.datePoll.findUnique({
      where: { eventId },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
          include: { votes: true },
        },
      },
    })
    if (!row) return null
    return DatePoll.fromJSON(row)
  }

  static async create(eventId: string): Promise<DatePoll> {
    const prisma = usePrisma()
    const row = await prisma.datePoll.create({
      data: { eventId },
      include: { options: { include: { votes: true } } },
    })
    return DatePoll.fromJSON(row)
  }

  static async setActive(id: string, isActive: boolean): Promise<DatePoll> {
    const prisma = usePrisma()
    const row = await prisma.datePoll.update({
      where: { id },
      data: { isActive, updatedAt: new Date() },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
          include: { votes: true },
        },
      },
    })
    return DatePoll.fromJSON(row)
  }

  static async delete(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.datePoll.delete({ where: { id } })
  }
}
