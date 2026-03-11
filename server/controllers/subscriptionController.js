import Subscription from '../entities/Subscription'
import EventPurchase from '../entities/EventPurchase'
import SubscriptionRepository from '../repositories/subscriptionRepository'
import EventPurchaseRepository from '../repositories/eventPurchaseRepository'
import EventRepository from '../repositories/eventRepository'
import { isTierCoveredBySubscription, EVENT_PRICES_CENTS, getFeaturesForTier } from '../utils/tierFeatures'

export default class SubscriptionController {
  static async getSubscription(clerkId) {
    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)
    if (!subscription) {
      return new Subscription({ userClerkId: clerkId, tier: 'free', status: 'active' }).toJSON()
    }
    return subscription.toJSON()
  }

  static async resolveEventTier(clerkId, requestedTier) {
    if (requestedTier === 'free') {
      return { tier: 'free', requiresPayment: false, priceCents: 0 }
    }

    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)
    const currentTier = subscription?.isActive ? subscription.tier : 'free'

    if (isTierCoveredBySubscription(currentTier, requestedTier)) {
      return { tier: requestedTier, requiresPayment: false, priceCents: 0 }
    }

    return {
      tier: 'free',
      requiresPayment: true,
      priceCents: EVENT_PRICES_CENTS[requestedTier],
    }
  }

  static async subscribe(clerkId, tier) {
    if (!['standard', 'pro'].includes(tier)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid subscription tier' })
    }

    const subscription = new Subscription({
      userClerkId: clerkId,
      tier,
      status: 'active',
    })

    const saved = await SubscriptionRepository.upsert(subscription)
    return saved.toJSON()
  }

  static async cancelSubscription(clerkId) {
    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)
    if (!subscription) {
      throw createError({ statusCode: 404, statusMessage: 'No subscription found' })
    }

    subscription.tier = 'free'
    subscription.status = 'canceled'

    const saved = await SubscriptionRepository.upsert(subscription)
    return saved.toJSON()
  }

  static async purchaseEventUpgrade(eventId, clerkId, tier) {
    if (!['standard', 'pro'].includes(tier)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid tier' })
    }

    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the owner can upgrade an event' })
    }

    const priceCents = EVENT_PRICES_CENTS[tier]

    const purchase = new EventPurchase({
      eventId,
      buyerClerkId: clerkId,
      tier,
      status: 'completed',
      amountCents: priceCents,
    })
    await EventPurchaseRepository.create(purchase)

    event.tier = tier
    event.features = getFeaturesForTier(tier)
    const saved = await EventRepository.update(event)

    return saved.toJSON()
  }

  static async getEventPurchases(clerkId) {
    const purchases = await EventPurchaseRepository.findByBuyer(clerkId)
    return purchases.map((p) => p.toJSON())
  }
}
