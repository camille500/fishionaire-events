import { usePrisma } from '../database'
import TimelineItem from '../entities/TimelineItem'

export default class TimelineItemRepository {
  static async create(item) {
    const prisma = usePrisma()
    const data = item.toJSON()
    const row = await prisma.timelineItem.create({
      data: {
        eventId: data.eventId,
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

  static async findByEventId(eventId) {
    const prisma = usePrisma()
    const rows = await prisma.timelineItem.findMany({
      where: { eventId },
      orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
    })
    return rows.map((row) => TimelineItem.fromJSON(row))
  }

  static async findById(id) {
    const prisma = usePrisma()
    const row = await prisma.timelineItem.findUnique({ where: { id } })
    if (!row) return null
    return TimelineItem.fromJSON(row)
  }

  static async update(item) {
    const prisma = usePrisma()
    const data = item.toJSON()
    const row = await prisma.timelineItem.update({
      where: { id: data.id },
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

  static async delete(id) {
    const prisma = usePrisma()
    await prisma.timelineItem.delete({ where: { id } })
  }

  static async reorder(eventId, orderedIds) {
    const prisma = usePrisma()
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.timelineItem.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )
  }

  static async bulkCreate(items) {
    const prisma = usePrisma()
    const rows = await Promise.all(
      items.map((item) =>
        prisma.timelineItem.create({
          data: {
            eventId: item.eventId,
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
