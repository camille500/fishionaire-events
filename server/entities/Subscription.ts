export interface SubscriptionData {
  id: string | null
  userClerkId: string
  tier: string
  status: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: string | Date | null
  cancelAtPeriodEnd: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SubscriptionJSON {
  id?: string | null
  userClerkId?: string
  user_clerk_id?: string
  tier?: string
  status?: string
  stripeCustomerId?: string | null
  stripe_customer_id?: string | null
  stripeSubscriptionId?: string | null
  stripe_subscription_id?: string | null
  currentPeriodEnd?: string | Date | null
  current_period_end?: string | Date | null
  cancelAtPeriodEnd?: boolean
  cancel_at_period_end?: boolean
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class Subscription {
  id: string | null
  userClerkId: string
  tier: string
  status: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: string | Date | null
  cancelAtPeriodEnd: boolean
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, userClerkId, tier, status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt }: SubscriptionData) {
    this.id = id || null
    this.userClerkId = userClerkId
    this.tier = tier || 'free'
    this.status = status || 'active'
    this.stripeCustomerId = stripeCustomerId || null
    this.stripeSubscriptionId = stripeSubscriptionId || null
    this.currentPeriodEnd = currentPeriodEnd || null
    this.cancelAtPeriodEnd = cancelAtPeriodEnd || false
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  get isActive(): boolean {
    return this.status === 'active'
  }

  get isPro(): boolean {
    return this.tier === 'pro' && this.isActive
  }

  get isStandard(): boolean {
    return (this.tier === 'standard' || this.tier === 'pro') && this.isActive
  }

  get isFree(): boolean {
    return this.tier === 'free'
  }

  static fromJSON(data: SubscriptionJSON): Subscription {
    return new Subscription({
      id: data.id ?? null,
      userClerkId: (data.userClerkId || data.user_clerk_id)!,
      tier: data.tier || 'free',
      status: data.status || 'active',
      stripeCustomerId: data.stripeCustomerId || data.stripe_customer_id || null,
      stripeSubscriptionId: data.stripeSubscriptionId || data.stripe_subscription_id || null,
      currentPeriodEnd: data.currentPeriodEnd || data.current_period_end || null,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? data.cancel_at_period_end ?? false,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): SubscriptionData {
    return {
      id: this.id,
      userClerkId: this.userClerkId,
      tier: this.tier,
      status: this.status,
      stripeCustomerId: this.stripeCustomerId,
      stripeSubscriptionId: this.stripeSubscriptionId,
      currentPeriodEnd: this.currentPeriodEnd,
      cancelAtPeriodEnd: this.cancelAtPeriodEnd,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
