import { usePrisma } from '../database'
import EventPurchase from '../entities/EventPurchase'

export default class EventPurchaseRepository {
  static async create(purchase) {
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

  static async findByEventId(eventId) {
    const prisma = usePrisma()
    const row = await prisma.eventPurchase.findFirst({ where: { eventId } })
    if (!row) return null
    return EventPurchase.fromJSON(row)
  }

  static async findByCheckoutSessionId(sessionId) {
    const prisma = usePrisma()
    const row = await prisma.eventPurchase.findFirst({
      where: { stripeCheckoutSessionId: sessionId },
    })
    if (!row) return null
    return EventPurchase.fromJSON(row)
  }

  static async updateStatus(id, status) {
    const prisma = usePrisma()
    const row = await prisma.eventPurchase.update({
      where: { id },
      data: { status },
    })
    return EventPurchase.fromJSON(row)
  }

  static async findByBuyer(clerkId) {
    const prisma = usePrisma()
    const rows = await prisma.eventPurchase.findMany({
      where: { buyerClerkId: clerkId },
    })
    return rows.map((row) => EventPurchase.fromJSON(row))
  }
}
