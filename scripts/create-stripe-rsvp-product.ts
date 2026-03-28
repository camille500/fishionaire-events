/**
 * One-off script to create the Standalone RSVP product and price in Stripe.
 *
 * Usage:
 *   npx tsx scripts/create-stripe-rsvp-product.ts
 *
 * Requires STRIPE_SECRET_KEY in .env
 */
import Stripe from 'stripe'
import { config } from 'dotenv'

config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function main() {
  // Create product
  const product = await stripe.products.create({
    name: 'Standalone RSVP',
    description: 'Create a standalone date poll & RSVP — invite up to 50 guests',
    metadata: { type: 'standalone_rsvp' },
  })
  console.log('Created product:', product.id)

  // Create price: €1.99 one-time
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 199,
    currency: 'eur',
    metadata: { type: 'standalone_rsvp' },
  })
  console.log('Created price:', price.id)
  console.log('')
  console.log('Add this to your .env:')
  console.log(`STRIPE_RSVP_PRICE_ID=${price.id}`)
}

main().catch(console.error)
