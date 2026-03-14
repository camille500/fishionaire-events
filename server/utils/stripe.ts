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
    event: {
      standard: config.stripeEventStandardPriceId,
      pro: config.stripeEventProPriceId,
    },
  }
  return map[type]?.[tier] || null
}
