import type { H3Event } from 'h3'
import RsvpController from '../../controllers/rsvpController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return RsvpController.listRsvps(userId)
})
