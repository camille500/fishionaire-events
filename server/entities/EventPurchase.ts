export interface EventPurchaseData {
  id: string | null
  eventId: string
  buyerClerkId: string
  tier: string
  status: string
  stripeCheckoutSessionId: string | null
  amountCents: number
  createdAt: Date | string
}

export interface EventPurchaseJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  buyerClerkId?: string
  buyer_clerk_id?: string
  tier: string
  status?: string
  stripeCheckoutSessionId?: string | null
  stripe_checkout_session_id?: string | null
  amountCents?: number
  amount_cents?: number
  createdAt?: Date | string
  created_at?: Date | string
}

export default class EventPurchase {
  id: string | null
  eventId: string
  buyerClerkId: string
  tier: string
  status: string
  stripeCheckoutSessionId: string | null
  amountCents: number
  createdAt: Date | string

  constructor({ id, eventId, buyerClerkId, tier, status, stripeCheckoutSessionId, amountCents, createdAt }: EventPurchaseData) {
    this.id = id || null
    this.eventId = eventId
    this.buyerClerkId = buyerClerkId
    this.tier = tier
    this.status = status || 'pending'
    this.stripeCheckoutSessionId = stripeCheckoutSessionId || null
    this.amountCents = amountCents
    this.createdAt = createdAt || new Date()
  }

  get isCompleted(): boolean {
    return this.status === 'completed'
  }

  static fromJSON(data: EventPurchaseJSON): EventPurchase {
    return new EventPurchase({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      buyerClerkId: (data.buyerClerkId || data.buyer_clerk_id)!,
      tier: data.tier,
      status: data.status || 'pending',
      stripeCheckoutSessionId: data.stripeCheckoutSessionId || data.stripe_checkout_session_id || null,
      amountCents: (data.amountCents || data.amount_cents)!,
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): EventPurchaseData {
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
