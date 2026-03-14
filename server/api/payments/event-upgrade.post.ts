import type { H3Event } from 'h3'
import { clerkClient } from '@clerk/nuxt/server'
import SubscriptionController from '../../controllers/subscriptionController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventId, tier } = await readBody<{ eventId: number, tier: string }>(event)

  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Event ID is required' })
  }

  const clerkUser = await clerkClient(event).users.getUser(userId)
  const email = clerkUser.emailAddresses[0]?.emailAddress

  const result = await SubscriptionController.createEventUpgradeCheckout(eventId, userId, tier, email)

  return result
})
