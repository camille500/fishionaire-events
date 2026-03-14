import { usePrisma } from '../database'
import EventPurchase from '../entities/EventPurchase'

export default class EventPurchaseRepository {
  static async create(purchase: EventPurchase): Promise<EventPurchase> {
    const prisma = usePrisma()
    const data = purchase.toJSON()
    const row = await prisma.eventPurchase.create({
      data: {
        eventId: data.eventId,
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
    const row = await prisma.eventPurchase.findFirst({ where: { eventId } })
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
      where: { id },
      data: { status },
    })
    return EventPurchase.fromJSON(row)
  }

  static async updateCheckoutSessionId(id: string, sessionId: string): Promise<EventPurchase> {
    const prisma = usePrisma()
    const row = await prisma.eventPurchase.update({
      where: { id },
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
}
