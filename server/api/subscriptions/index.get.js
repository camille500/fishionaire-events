import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return await SubscriptionController.getSubscription(userId)
})
