import { usePrisma } from '../database'
import SubEventPlusOne from '../entities/SubEventPlusOne'

export default class SubEventPlusOneRepository {
  static async create(data: { subEventId: string, guestEmail: string, plusOneName: string }): Promise<SubEventPlusOne> {
    const prisma = usePrisma()
    const row = await prisma.subEventPlusOne.create({
      data: {
        subEventId: Number(data.subEventId),
        guestEmail: data.guestEmail,
        plusOneName: data.plusOneName,
      },
    })
    return SubEventPlusOne.fromJSON(row)
  }

  static async findBySubEventId(subEventId: string): Promise<SubEventPlusOne[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventPlusOne.findMany({
      where: { subEventId: Number(subEventId) },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => SubEventPlusOne.fromJSON(row))
  }

  static async countBySubEventId(subEventId: string): Promise<number> {
    const prisma = usePrisma()
    return prisma.subEventPlusOne.count({ where: { subEventId: Number(subEventId) } })
  }

  static async delete(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.subEventPlusOne.delete({ where: { id: Number(id) } })
  }
}
