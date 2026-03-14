import Subscription from '../entities/Subscription'
import EventPurchase from '../entities/EventPurchase'
import SubscriptionRepository from '../repositories/subscriptionRepository'
import EventPurchaseRepository from '../repositories/eventPurchaseRepository'
import EventRepository from '../repositories/eventRepository'
import { isTierCoveredBySubscription, EVENT_PRICES_CENTS, getFeaturesForTier } from '../utils/tierFeatures'
import { useStripe, getStripePriceId } from '../utils/stripe'

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

  static async _findOrCreateCustomer(clerkId, email) {
    const stripe = useStripe()
    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)
    let customerId = subscription?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { clerkId },
      })
      customerId = customer.id

      const sub = new Subscription({
        ...(subscription ? subscription.toJSON() : {}),
        userClerkId: clerkId,
        stripeCustomerId: customerId,
        status: subscription?.status || 'active',
        tier: subscription?.tier || 'free',
      })
      await SubscriptionRepository.upsert(sub)
    }

    return customerId
  }

  static async createCheckoutSession(clerkId, tier, email) {
    if (!['standard', 'pro'].includes(tier)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid subscription tier' })
    }

    const stripe = useStripe()
    const priceId = getStripePriceId(tier, 'subscription')
    const customerId = await this._findOrCreateCustomer(clerkId, email)

    // Cancel any existing active subscriptions to prevent duplicates
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    })
    for (const sub of existingSubs.data) {
      await stripe.subscriptions.cancel(sub.id)
    }

    const config = useRuntimeConfig()
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.public.appUrl}/facturering?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.public.appUrl}/facturering`,
      metadata: { clerkId, tier },
      subscription_data: { metadata: { clerkId, tier } },
    })

    return { url: session.url }
  }

  static async createPortalSession(clerkId) {
    const stripe = useStripe()
    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)

    if (!subscription?.stripeCustomerId) {
      throw createError({ statusCode: 404, statusMessage: 'No subscription found' })
    }

    const config = useRuntimeConfig()
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${config.public.appUrl}/facturering`,
    })

    return { url: session.url }
  }

  static async createEventUpgradeCheckout(eventId, clerkId, tier, email) {
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

    const stripe = useStripe()
    const priceId = getStripePriceId(tier, 'event')
    const customerId = await this._findOrCreateCustomer(clerkId, email)
    const priceCents = EVENT_PRICES_CENTS[tier]

    const purchase = new EventPurchase({
      eventId,
      buyerClerkId: clerkId,
      tier,
      status: 'pending',
      amountCents: priceCents,
    })
    const savedPurchase = await EventPurchaseRepository.create(purchase)

    const config = useRuntimeConfig()
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.public.appUrl}/dashboard/events/${eventId}?upgraded=true`,
      cancel_url: `${config.public.appUrl}/dashboard/events/${eventId}`,
      metadata: {
        clerkId,
        eventId: String(eventId),
        tier,
        purchaseId: String(savedPurchase.id),
      },
    })

    await EventPurchaseRepository.updateCheckoutSessionId(savedPurchase.id, session.id)

    return { url: session.url }
  }

  static async verifyCheckoutSession(sessionId) {
    const stripe = useStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.status === 'complete') {
      await this.handleCheckoutCompleted(session)
      return { verified: true }
    }

    return { verified: false }
  }

  static async handleCheckoutCompleted(session) {
    if (session.mode === 'subscription') {
      const { clerkId, tier } = session.metadata
      const stripe = useStripe()
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription)

      const periodEnd = stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null

      const sub = new Subscription({
        userClerkId: clerkId,
        tier,
        status: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
      })
      await SubscriptionRepository.upsert(sub)
    }

    if (session.mode === 'payment') {
      const { eventId, tier, purchaseId } = session.metadata

      await EventPurchaseRepository.updateStatus(Number(purchaseId), 'completed')
      await EventPurchaseRepository.updateCheckoutSessionId(Number(purchaseId), session.id)

      const event = await EventRepository.findById(Number(eventId))
      if (event) {
        event.tier = tier
        event.features = getFeaturesForTier(tier)
        await EventRepository.update(event)
      }
    }
  }

  static async handleSubscriptionUpdated(stripeSubscription) {
    const sub = await SubscriptionRepository.findByStripeSubscriptionId(stripeSubscription.id)
    if (!sub) return

    const config = useRuntimeConfig()
    const priceId = stripeSubscription.items.data[0]?.price?.id
    let tier = sub.tier
    if (priceId === config.stripeStandardPriceId) tier = 'standard'
    if (priceId === config.stripeProPriceId) tier = 'pro'

    sub.tier = tier
    sub.status = stripeSubscription.status === 'active' ? 'active' : stripeSubscription.status
    sub.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000)
    sub.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end
    await SubscriptionRepository.upsert(sub)
  }

  static async handleSubscriptionDeleted(stripeSubscription) {
    const sub = await SubscriptionRepository.findByStripeSubscriptionId(stripeSubscription.id)
    if (!sub) return

    sub.tier = 'free'
    sub.status = 'canceled'
    sub.stripeSubscriptionId = null
    sub.cancelAtPeriodEnd = false
    await SubscriptionRepository.upsert(sub)
  }

  static async getEventPurchases(clerkId) {
    const purchases = await EventPurchaseRepository.findByBuyer(clerkId)
    return purchases.map((p) => p.toJSON())
  }
}
