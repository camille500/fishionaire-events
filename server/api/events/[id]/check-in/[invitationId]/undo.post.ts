import type { H3Event } from 'h3'
import CheckInController from '../../../../../controllers/checkInController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const invitationId = parseInt(getRouterParam(event, 'invitationId')!)
  if (isNaN(invitationId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invitation ID' })
  }

  return CheckInController.undoCheckIn(eventId, invitationId, userId)
})
