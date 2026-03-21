import { usePrisma } from '../database'
import SubEventDietary from '../entities/SubEventDietary'

export default class SubEventDietaryRepository {
  static async upsert(subEventId: string, guestEmail: string, data: { guestName?: string | null, restrictions: string, notes?: string | null }): Promise<SubEventDietary> {
    const prisma = usePrisma()
    const row = await prisma.subEventDietary.upsert({
      where: {
        subEventId_guestEmail: { subEventId: Number(subEventId), guestEmail },
      },
      create: {
        subEventId: Number(subEventId),
        guestEmail,
        guestName: data.guestName || null,
        restrictions: data.restrictions,
        notes: data.notes || null,
      },
      update: {
        guestName: data.guestName || null,
        restrictions: data.restrictions,
        notes: data.notes || null,
        updatedAt: new Date(),
      },
    })
    return SubEventDietary.fromJSON(row)
  }

  static async findAllByEventId(eventId: string): Promise<SubEventDietary[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventDietary.findMany({
      where: { subEvent: { eventId: Number(eventId) } },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => SubEventDietary.fromJSON(row))
  }

  static async findBySubEventId(subEventId: string): Promise<SubEventDietary[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventDietary.findMany({
      where: { subEventId: Number(subEventId) },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => SubEventDietary.fromJSON(row))
  }

  static async findByGuestEmail(subEventId: string, guestEmail: string): Promise<SubEventDietary | null> {
    const prisma = usePrisma()
    const row = await prisma.subEventDietary.findUnique({
      where: {
        subEventId_guestEmail: { subEventId: Number(subEventId), guestEmail },
      },
    })
    if (!row) return null
    return SubEventDietary.fromJSON(row)
  }

  static async delete(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.subEventDietary.delete({ where: { id: Number(id) } })
  }
}
