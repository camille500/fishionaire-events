export default class EventPurchase {
  constructor({ id, eventId, buyerClerkId, tier, status, stripeCheckoutSessionId, amountCents, createdAt }) {
    this.id = id || null
    this.eventId = eventId
    this.buyerClerkId = buyerClerkId
    this.tier = tier
    this.status = status || 'pending'
    this.stripeCheckoutSessionId = stripeCheckoutSessionId || null
    this.amountCents = amountCents
    this.createdAt = createdAt || new Date()
  }

  get isCompleted() {
    return this.status === 'completed'
  }

  static fromJSON(data) {
    return new EventPurchase({
      id: data.id,
      eventId: data.eventId || data.event_id,
      buyerClerkId: data.buyerClerkId || data.buyer_clerk_id,
      tier: data.tier,
      status: data.status,
      stripeCheckoutSessionId: data.stripeCheckoutSessionId || data.stripe_checkout_session_id,
      amountCents: data.amountCents || data.amount_cents,
      createdAt: data.createdAt || data.created_at,
    })
  }

  toJSON() {
    return {
      id: this.id,
      eventId: this.eventId,
      buyerClerkId: this.buyerClerkId,
      tier: this.tier,
      status: this.status,
      stripeCheckoutSessionId: this.stripeCheckoutSessionId,
      amountCents: this.amountCents,
      createdAt: this.createdAt,
    }
  }
}
