import { usePrisma } from '../database'
import EventPurchase from '../entities/EventPurchase'

export default class EventPurchaseRepository {
  static async create(purchase: EventPurchase): Promise<EventPurchase> {
    const prisma = usePrisma()
    const data = purchase.toJSON()
    const row = await prisma.eventPurchase.create({
      data: {
        eventId: Number(data.eventId),
        buyerClerkId: data.buyerClerkId,
        tier: data.tier,
        status: data.status,
        stripeCheckoutSessionId: data.stripeCheckoutSessionId,
        amountCents: data.amountCents,
      },
    })
    return EventPurchase.fromJSON(row)
  }

  static async findByEventId(eventId: string): Promise<EventPurchase | null> {
    const prisma = usePrisma()
    const row = await prisma.eventPurchase.findFirst({ where: { eventId: Number(eventId) } })
    if (!row) return null
    return EventPurchase.fromJSON(row)
  }

  static async findByCheckoutSessionId(sessionId: string): Promise<EventPurchase | null> {
    const prisma = usePrisma()
    const row = await prisma.eventPurchase.findFirst({
      where: { stripeCheckoutSessionId: sessionId },
    })
    if (!row) return null
    return EventPurchase.fromJSON(row)
  }

  static async updateStatus(id: string, status: string): Promise<EventPurchase> {
    const prisma = usePrisma()
    const row = await prisma.eventPurchase.update({
      where: { id: Number(id) },
      data: { status },
    })
    return EventPurchase.fromJSON(row)
  }

  static async updateCheckoutSessionId(id: string, sessionId: string): Promise<EventPurchase> {
    const prisma = usePrisma()
    const row = await prisma.eventPurchase.update({
      where: { id: Number(id) },
      data: { stripeCheckoutSessionId: sessionId },
    })
    return EventPurchase.fromJSON(row)
  }

  static async findByBuyer(clerkId: string): Promise<EventPurchase[]> {
    const prisma = usePrisma()
    const rows = await prisma.eventPurchase.findMany({
      where: { buyerClerkId: clerkId },
    })
    return rows.map((row) => EventPurchase.fromJSON(row))
  }

  static async getRevenueStats(): Promise<{ totalRevenueCents: number, purchaseCount: number }> {
    const prisma = usePrisma()
    const result = await prisma.eventPurchase.aggregate({
      where: { status: 'completed' },
      _sum: { amountCents: true },
      _count: true,
    })
    return {
      totalRevenueCents: result._sum.amountCents || 0,
      purchaseCount: result._count,
    }
  }

  static async revenueGroupedByDate(days: number = 30): Promise<{ date: string, totalCents: number }[]> {
    const prisma = usePrisma()
    const since = new Date()
    since.setDate(since.getDate() - days)

    const rows = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COALESCE(SUM(amount_cents), 0)::int as "totalCents"
      FROM event_purchases
      WHERE status = 'completed' AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
    return (rows as { date: string, totalCents: number }[]).map((r) => ({ date: r.date, totalCents: r.totalCents }))
  }
}
