import type { H3Event } from 'h3'
import SubEventRsvpController from '../../../../../controllers/subEventRsvpController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  const subEventId = parseInt(getRouterParam(event, 'subEventId'))
  if (isNaN(eventId) || isNaN(subEventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const { email, status } = await readBody<{ email: string, status: string }>(event)
  return SubEventRsvpController.rsvpToSubEvent(eventId, subEventId, email, status)
})
