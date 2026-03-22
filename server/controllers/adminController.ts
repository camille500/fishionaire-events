import UserRepository from '../repositories/userRepository'
import SubscriptionRepository from '../repositories/subscriptionRepository'
import EventRepository from '../repositories/eventRepository'
import EventPurchaseRepository from '../repositories/eventPurchaseRepository'
import EventViewRepository from '../repositories/eventViewRepository'

interface ListOptions {
  search?: string
  offset: number
  limit: number
}

export default class AdminController {
  static async getDashboardStats() {
    const [userCount, tierCounts, eventCount, revenue] = await Promise.all([
      UserRepository.countAll(),
      SubscriptionRepository.countByTier(),
      EventRepository.countAll(),
      EventPurchaseRepository.getRevenueStats(),
    ])

    return {
      users: userCount,
      events: eventCount,
      subscriptions: tierCounts,
      revenue: {
        totalCents: revenue.totalRevenueCents,
        purchaseCount: revenue.purchaseCount,
      },
    }
  }

  static async listUsers(options: ListOptions & { role?: string }) {
    const { users, total } = await UserRepository.findAll(options)
    return {
      data: users.map((u) => u.toJSON()),
      total,
      page: Math.floor(options.offset / options.limit),
      limit: options.limit,
    }
  }

  static async getUserDetail(clerkId: string) {
    const user = await UserRepository.findByClerkId(clerkId)
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const [subscription, events, purchases] = await Promise.all([
      SubscriptionRepository.findByUserClerkId(clerkId),
      EventRepository.findByOwner(clerkId),
      EventPurchaseRepository.findByBuyer(clerkId),
    ])

    return {
      user: user.toJSON(),
      subscription: subscription ? subscription.toJSON() : null,
      events: events.map((e) => e.toJSON()),
      purchases: purchases.map((p) => p.toJSON()),
    }
  }

  static async updateUserRole(clerkId: string, role: string) {
    if (!['user', 'admin'].includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid role' })
    }

    const user = await UserRepository.updateRole(clerkId, role)
    return user.toJSON()
  }

  static async listSubscriptions(options: ListOptions & { tier?: string, status?: string }) {
    const { subscriptions, total } = await SubscriptionRepository.findAll(options)
    return {
      data: subscriptions.map((s) => ({
        ...s.subscription.toJSON(),
        user: s.user,
      })),
      total,
      page: Math.floor(options.offset / options.limit),
      limit: options.limit,
    }
  }

  static async updateSubscription(userClerkId: string, tier: string, status: string) {
    if (!['free', 'standard', 'pro'].includes(tier)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid tier' })
    }
    if (!['active', 'past_due', 'canceled', 'incomplete'].includes(status)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
    }

    const subscription = await SubscriptionRepository.updateTier(userClerkId, tier, status)
    return subscription.toJSON()
  }

  static async listEvents(options: ListOptions) {
    const { events, total } = await EventRepository.findAllAdmin(options)
    return {
      data: events.map((e) => e.toJSON()),
      total,
      page: Math.floor(options.offset / options.limit),
      limit: options.limit,
    }
  }

  static async getAnalytics(days: number = 30) {
    const [userGrowth, eventGrowth, revenueOverTime, viewsOverTime] = await Promise.all([
      UserRepository.countGroupedByDate(days),
      EventRepository.countGroupedByDate(days),
      EventPurchaseRepository.revenueGroupedByDate(days),
      EventViewRepository.countAllGroupedByDate(days),
    ])

    return {
      userGrowth,
      eventGrowth,
      revenueOverTime,
      viewsOverTime,
    }
  }
}
