import type { H3Event } from 'h3'
import SubEventRsvpController from '../../../controllers/subEventRsvpController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const { email } = getQuery<{ email?: string }>(event)
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  return SubEventRsvpController.getMyRsvps(eventId, email)
})
