export default class Subscription {
  constructor({ id, userClerkId, tier, status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt }) {
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

  get isActive() {
    return this.status === 'active'
  }

  get isPro() {
    return this.tier === 'pro' && this.isActive
  }

  get isStandard() {
    return (this.tier === 'standard' || this.tier === 'pro') && this.isActive
  }

  get isFree() {
    return this.tier === 'free'
  }

  static fromJSON(data) {
    return new Subscription({
      id: data.id,
      userClerkId: data.userClerkId || data.user_clerk_id,
      tier: data.tier,
      status: data.status,
      stripeCustomerId: data.stripeCustomerId || data.stripe_customer_id,
      stripeSubscriptionId: data.stripeSubscriptionId || data.stripe_subscription_id,
      currentPeriodEnd: data.currentPeriodEnd || data.current_period_end,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? data.cancel_at_period_end ?? false,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    })
  }

  toJSON() {
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
