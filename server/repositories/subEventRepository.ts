import { usePrisma } from '../database'
import SubEvent from '../entities/SubEvent'

interface SubEventCreateData {
  eventId: string
  title: string
  description?: string | null
  startTime?: Date | string | null
  endTime?: Date | string | null
  location?: string | null
  sortOrder?: number
}

export default class SubEventRepository {
  static async create(subEvent: SubEvent): Promise<SubEvent> {
    const prisma = usePrisma()
    const data = subEvent.toJSON()
    const row = await prisma.subEvent.create({
      data: {
        eventId: data.eventId,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        sortOrder: data.sortOrder,
      },
    })
    return SubEvent.fromJSON(row)
  }

  static async findByEventId(eventId: string): Promise<SubEvent[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEvent.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' },
    })
    return rows.map((row) => SubEvent.fromJSON(row))
  }

  static async findById(id: string): Promise<SubEvent | null> {
    const prisma = usePrisma()
    const row = await prisma.subEvent.findUnique({ where: { id } })
    if (!row) return null
    return SubEvent.fromJSON(row)
  }

  static async update(subEvent: SubEvent): Promise<SubEvent> {
    const prisma = usePrisma()
    const data = subEvent.toJSON()
    const row = await prisma.subEvent.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      },
    })
    return SubEvent.fromJSON(row)
  }

  static async delete(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.subEvent.delete({ where: { id } })
  }

  static async reorder(eventId: string, orderedIds: string[]): Promise<void> {
    const prisma = usePrisma()
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.subEvent.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )
  }

  static async bulkCreate(subEvents: SubEventCreateData[]): Promise<SubEvent[]> {
    const prisma = usePrisma()
    const rows = await Promise.all(
      subEvents.map((se) =>
        prisma.subEvent.create({
          data: {
            eventId: se.eventId,
            title: se.title,
            description: se.description,
            startTime: se.startTime,
            endTime: se.endTime,
            location: se.location,
            sortOrder: se.sortOrder,
          },
        })
      )
    )
    return rows.map((row) => SubEvent.fromJSON(row))
  }
}
