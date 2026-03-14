import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { sessionId } = await readBody(event)

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing session_id' })
  }

  const result = await SubscriptionController.verifyCheckoutSession(sessionId)

  return result
})
