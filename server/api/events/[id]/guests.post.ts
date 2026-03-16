import type { H3Event } from 'h3'
import EventController from '../../../controllers/eventController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const { email, name, plusOnes, subEventInvites } = await readBody<{
    email: string
    name?: string
    plusOnes?: number
    subEventInvites?: { subEventId: number, plusOnes: number }[]
  }>(event)

  const result = await EventController.inviteToEvent(
    eventId,
    userId,
    email,
    name || null,
    plusOnes || 0,
    subEventInvites || []
  )

  setResponseStatus(event, 201)
  return result
})
