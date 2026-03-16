import type { H3Event } from 'h3'
import { clerkClient } from '@clerk/nuxt/server'
import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { tier, interval, eventId } = await readBody<{ tier: string, interval?: 'monthly' | 'yearly', eventId?: number }>(event)

  const clerkUser = await clerkClient(event).users.getUser(userId)
  const email = clerkUser.emailAddresses[0]?.emailAddress

  const result = await SubscriptionController.createCheckoutSession(userId, tier, email, interval || 'monthly', eventId)

  return result
})
