import { usePrisma } from '../database'
import TimelineItem from '../entities/TimelineItem'

interface TimelineItemCreateData {
  eventId: string
  title: string
  description?: string | null
  location?: string | null
  startTime: Date | string
  endTime?: Date | string | null
  sortOrder?: number
}

export default class TimelineItemRepository {
  static async create(item: TimelineItem): Promise<TimelineItem> {
    const prisma = usePrisma()
    const data = item.toJSON()
    const row = await prisma.timelineItem.create({
      data: {
        eventId: Number(data.eventId),
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: data.startTime,
        endTime: data.endTime,
        sortOrder: data.sortOrder,
      },
    })
    return TimelineItem.fromJSON(row)
  }

  static async findByEventId(eventId: string): Promise<TimelineItem[]> {
    const prisma = usePrisma()
    const rows = await prisma.timelineItem.findMany({
      where: { eventId: Number(eventId) },
      orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
    })
    return rows.map((row) => TimelineItem.fromJSON(row))
  }

  static async findById(id: string): Promise<TimelineItem | null> {
    const prisma = usePrisma()
    const row = await prisma.timelineItem.findUnique({ where: { id: Number(id) } })
    if (!row) return null
    return TimelineItem.fromJSON(row)
  }

  static async update(item: TimelineItem): Promise<TimelineItem> {
    const prisma = usePrisma()
    const data = item.toJSON()
    const row = await prisma.timelineItem.update({
      where: { id: Number(data.id) },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: data.startTime,
        endTime: data.endTime,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      },
    })
    return TimelineItem.fromJSON(row)
  }

  static async delete(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.timelineItem.delete({ where: { id: Number(id) } })
  }

  static async reorder(eventId: string, orderedIds: string[]): Promise<void> {
    const prisma = usePrisma()
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.timelineItem.update({
          where: { id: Number(id) },
          data: { sortOrder: index },
        })
      )
    )
  }

  static async bulkCreate(items: TimelineItemCreateData[]): Promise<TimelineItem[]> {
    const prisma = usePrisma()
    const rows = await Promise.all(
      items.map((item) =>
        prisma.timelineItem.create({
          data: {
            eventId: Number(item.eventId),
            title: item.title,
            description: item.description,
            location: item.location,
            startTime: item.startTime,
            endTime: item.endTime,
            sortOrder: item.sortOrder,
          },
        })
      )
    )
    return rows.map((row) => TimelineItem.fromJSON(row))
  }
}
