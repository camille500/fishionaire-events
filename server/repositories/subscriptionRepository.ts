import { usePrisma } from '../database'
import Subscription from '../entities/Subscription'

export default class SubscriptionRepository {
  static async findByUserClerkId(clerkId: string): Promise<Subscription | null> {
    const prisma = usePrisma()
    const row = await prisma.subscription.findUnique({ where: { userClerkId: clerkId } })
    if (!row) return null
    return Subscription.fromJSON(row)
  }

  static async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const prisma = usePrisma()
    const row = await prisma.subscription.findFirst({ where: { stripeSubscriptionId } })
    if (!row) return null
    return Subscription.fromJSON(row)
  }

  static async upsert(subscription: Subscription): Promise<Subscription> {
    const data = subscription.toJSON()
    const prisma = usePrisma()
    const row = await prisma.subscription.upsert({
      where: { userClerkId: data.userClerkId },
      create: {
        userClerkId: data.userClerkId,
        tier: data.tier,
        status: data.status,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      },
      update: {
        tier: data.tier,
        status: data.status,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        updatedAt: new Date(),
      },
    })
    return Subscription.fromJSON(row)
  }
}
