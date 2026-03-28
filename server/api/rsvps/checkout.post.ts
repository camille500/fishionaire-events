import type { H3Event } from 'h3'
import { clerkClient } from '@clerk/nuxt/server'
import RsvpController from '../../controllers/rsvpController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const clerkUser = await clerkClient(event).users.getUser(userId)
  const email = clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email not found' })
  }

  return RsvpController.createRsvpCheckout(userId, email)
})
