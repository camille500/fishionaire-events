import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function useStripe(): Stripe {
  if (!stripeInstance) {
    const config = useRuntimeConfig()
    stripeInstance = new Stripe(config.stripeSecretKey)
  }
  return stripeInstance
}

export function getStripePriceId(tier: string, type: string = 'subscription'): string | null {
  const config = useRuntimeConfig()
  const map = {
    subscription: {
      standard: config.stripeStandardPriceId,
      pro: config.stripeProPriceId,
    },
    subscription_yearly: {
      standard: config.stripeStandardYearlyPriceId,
      pro: config.stripeProYearlyPriceId,
    },
    event: {
      standard: config.stripeEventStandardPriceId,
      pro: config.stripeEventProPriceId,
    },
    rsvp: {
      standalone: config.stripeRsvpPriceId,
    },
  }
  return (map as Record<string, Record<string, string>>)[type]?.[tier] || null
}

export function getStripeRsvpPriceId(): string | null {
  const config = useRuntimeConfig()
  return config.stripeRsvpPriceId || null
}
