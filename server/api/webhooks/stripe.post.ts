import { useStripe } from '../../utils/stripe'
import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event) => {
  const stripe = useStripe()
  const config = useRuntimeConfig()
  const body = await readRawBody(event)
  const signature = getHeader(event, 'stripe-signature')

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(body, signature, config.stripeWebhookSecret)
  } catch (err) {
    throw createError({ statusCode: 400, statusMessage: `Webhook signature verification failed: ${err.message}` })
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      await SubscriptionController.handleCheckoutCompleted(stripeEvent.data.object)
      break
    case 'customer.subscription.updated':
      await SubscriptionController.handleSubscriptionUpdated(stripeEvent.data.object)
      break
    case 'customer.subscription.deleted':
      await SubscriptionController.handleSubscriptionDeleted(stripeEvent.data.object)
      break
  }

  return { received: true }
})
