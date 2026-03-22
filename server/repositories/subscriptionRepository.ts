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

  static async findAll(options: { tier?: string, status?: string, offset: number, limit: number }): Promise<{ subscriptions: Array<{ subscription: Subscription, user: { email: string, firstName: string | null, lastName: string | null } }>, total: number }> {
    const prisma = usePrisma()
    const where: Record<string, unknown> = {}

    if (options.tier) where.tier = options.tier
    if (options.status) where.status = options.status

    const [rows, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { updatedAt: 'desc' },
        skip: options.offset,
        take: options.limit,
      }),
      prisma.subscription.count({ where }),
    ])

    return {
      subscriptions: rows.map((row: any) => ({
        subscription: Subscription.fromJSON(row),
        user: { email: row.user.email, firstName: row.user.firstName, lastName: row.user.lastName },
      })),
      total,
    }
  }

  static async countByTier(): Promise<Record<string, number>> {
    const prisma = usePrisma()
    const groups = await prisma.subscription.groupBy({
      by: ['tier'],
      _count: true,
    })
    const result: Record<string, number> = { free: 0, standard: 0, pro: 0 }
    for (const g of groups) {
      result[g.tier] = g._count
    }
    return result
  }

  static async updateTier(userClerkId: string, tier: string, status: string): Promise<Subscription> {
    const prisma = usePrisma()
    const row = await prisma.subscription.update({
      where: { userClerkId },
      data: { tier: tier as any, status: status as any, updatedAt: new Date() },
    })
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
