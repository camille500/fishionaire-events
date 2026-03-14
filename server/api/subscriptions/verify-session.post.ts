import type { H3Event } from 'h3'
import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { sessionId } = await readBody<{ sessionId: string }>(event)

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing session_id' })
  }

  const result = await SubscriptionController.verifyCheckoutSession(sessionId)

  return result
})
