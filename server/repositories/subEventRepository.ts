import { usePrisma } from '../database'
import SubEvent from '../entities/SubEvent'
import type { SubEventTypeValue } from '../entities/SubEvent'

interface SubEventCreateData {
  eventId: string
  title: string
  description?: string | null
  type?: SubEventTypeValue
  richContent?: string | null
  coverImageUrl?: string | null
  coverImageKey?: string | null
  capacity?: number | null
  dressCode?: string | null
  typeConfig?: Record<string, unknown>
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
        eventId: Number(data.eventId),
        title: data.title,
        description: data.description,
        type: data.type,
        richContent: data.richContent,
        coverImageUrl: data.coverImageUrl,
        coverImageKey: data.coverImageKey,
        capacity: data.capacity,
        dressCode: data.dressCode,
        typeConfig: data.typeConfig,
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
      where: { eventId: Number(eventId) },
      orderBy: { sortOrder: 'asc' },
    })
    return rows.map((row) => SubEvent.fromJSON(row))
  }

  static async findById(id: string): Promise<SubEvent | null> {
    const prisma = usePrisma()
    const row = await prisma.subEvent.findUnique({ where: { id: Number(id) } })
    if (!row) return null
    return SubEvent.fromJSON(row)
  }

  static async findByIdWithCounts(id: string): Promise<{ subEvent: SubEvent, rsvpCount: number, dietaryCount: number, plusOneCount: number, musicRequestCount: number } | null> {
    const prisma = usePrisma()
    const row = await prisma.subEvent.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            rsvps: true,
            dietaryResponses: true,
            plusOneRequests: true,
            musicRequests: true,
          },
        },
      },
    })
    if (!row) return null
    return {
      subEvent: SubEvent.fromJSON(row),
      rsvpCount: row._count.rsvps,
      dietaryCount: row._count.dietaryResponses,
      plusOneCount: row._count.plusOneRequests,
      musicRequestCount: row._count.musicRequests,
    }
  }

  static async update(subEvent: SubEvent): Promise<SubEvent> {
    const prisma = usePrisma()
    const data = subEvent.toJSON()
    const row = await prisma.subEvent.update({
      where: { id: Number(data.id) },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        richContent: data.richContent,
        coverImageUrl: data.coverImageUrl,
        coverImageKey: data.coverImageKey,
        capacity: data.capacity,
        dressCode: data.dressCode,
        typeConfig: data.typeConfig,
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
    await prisma.subEvent.delete({ where: { id: Number(id) } })
  }

  static async reorder(eventId: string, orderedIds: string[]): Promise<void> {
    const prisma = usePrisma()
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.subEvent.update({
          where: { id: Number(id) },
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
            eventId: Number(se.eventId),
            title: se.title,
            description: se.description,
            type: se.type || 'generic',
            richContent: se.richContent,
            coverImageUrl: se.coverImageUrl,
            coverImageKey: se.coverImageKey,
            capacity: se.capacity,
            dressCode: se.dressCode,
            typeConfig: se.typeConfig || {},
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
