import { clerkClient } from '@clerk/nuxt/server'
import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { tier } = await readBody(event)

  const clerkUser = await clerkClient(event).users.getUser(userId)
  const email = clerkUser.emailAddresses[0]?.emailAddress

  const result = await SubscriptionController.createCheckoutSession(userId, tier, email)

  return result
})
