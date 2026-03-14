import Stripe from 'stripe'

let stripeInstance = null

export function useStripe() {
  if (!stripeInstance) {
    const config = useRuntimeConfig()
    stripeInstance = new Stripe(config.stripeSecretKey)
  }
  return stripeInstance
}

export function getStripePriceId(tier, type = 'subscription') {
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
