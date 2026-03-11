import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventId, tier } = await readBody(event)

  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Event ID is required' })
  }

  // Phase 1: directly upgrade event (Phase 2: Stripe Checkout redirect)
  const upgraded = await SubscriptionController.purchaseEventUpgrade(eventId, userId, tier)

  return { event: upgraded }
})
