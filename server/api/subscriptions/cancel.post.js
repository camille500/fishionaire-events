import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Phase 1: directly cancel (Phase 2: Stripe Customer Portal)
  const subscription = await SubscriptionController.cancelSubscription(userId)

  return { subscription }
})
