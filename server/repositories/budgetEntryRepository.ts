import { usePrisma } from '../database'
import BudgetEntry from '../entities/BudgetEntry'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export interface BudgetStats {
  totalSpentCents: number
  entryCount: number
  categoryBreakdown: Array<{ category: string, totalCents: number, count: number }>
}

export default class BudgetEntryRepository {
  static async create(entry: BudgetEntry): Promise<BudgetEntry> {
    const prisma = usePrisma()
    const row = await prisma.budgetEntry.create({
      data: {
        eventId: toInt(entry.eventId),
        description: entry.description,
        amountCents: entry.amountCents,
        currency: entry.currency,
        category: entry.category,
        paidAt: new Date(entry.paidAt),
        notes: entry.notes,
      },
    })
    return BudgetEntry.fromJSON(row as any)
  }

  static async findByEventId(eventId: number): Promise<BudgetEntry[]> {
    const prisma = usePrisma()
    const rows = await prisma.budgetEntry.findMany({
      where: { eventId: toInt(eventId) },
      orderBy: { paidAt: 'desc' },
    })
    return rows.map((row: any) => BudgetEntry.fromJSON(row))
  }

  static async findById(id: number): Promise<BudgetEntry | null> {
    const prisma = usePrisma()
    const row = await prisma.budgetEntry.findUnique({
      where: { id: toInt(id) },
    })
    return row ? BudgetEntry.fromJSON(row as any) : null
  }

  static async update(entry: BudgetEntry): Promise<BudgetEntry> {
    const prisma = usePrisma()
    const row = await prisma.budgetEntry.update({
      where: { id: toInt(entry.id!) },
      data: {
        description: entry.description,
        amountCents: entry.amountCents,
        currency: entry.currency,
        category: entry.category,
        paidAt: new Date(entry.paidAt),
        notes: entry.notes,
        updatedAt: new Date(),
      },
    })
    return BudgetEntry.fromJSON(row as any)
  }

  static async delete(id: number): Promise<void> {
    const prisma = usePrisma()
    await prisma.budgetEntry.delete({ where: { id: toInt(id) } })
  }

  static async getStatsForEvent(eventId: number): Promise<BudgetStats> {
    const prisma = usePrisma()
    const groups = await prisma.budgetEntry.groupBy({
      by: ['category'],
      where: { eventId: toInt(eventId) },
      _sum: { amountCents: true },
      _count: true,
    })

    let totalSpentCents = 0
    let entryCount = 0
    const categoryBreakdown = groups.map((g: any) => {
      const totalCents = g._sum.amountCents || 0
      totalSpentCents += totalCents
      entryCount += g._count
      return {
        category: g.category,
        totalCents,
        count: g._count,
      }
    })

    categoryBreakdown.sort((a, b) => b.totalCents - a.totalCents)

    return { totalSpentCents, entryCount, categoryBreakdown }
  }
}
