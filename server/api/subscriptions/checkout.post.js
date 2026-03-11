import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { tier } = await readBody(event)

  // Phase 1: directly activate subscription (Phase 2: Stripe Checkout redirect)
  const subscription = await SubscriptionController.subscribe(userId, tier)

  return { subscription }
})
