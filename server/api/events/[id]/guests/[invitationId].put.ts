import type { H3Event } from 'h3'
import EventController from '../../../../controllers/eventController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  const invitationId = parseInt(getRouterParam(event, 'invitationId'))
  if (isNaN(eventId) || isNaN(invitationId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const body = await readBody<{
    inviteeName?: string | null
    plusOnes?: number
    subEventInvites?: { subEventId: number, plusOnes: number }[]
  }>(event)

  return await EventController.updateGuest(eventId, invitationId, userId, body)
})
