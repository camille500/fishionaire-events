import type { H3Event } from 'h3'
import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const result = await SubscriptionController.createPortalSession(userId)

  return result
})
