import type { H3Event } from 'h3'
import EventController from '../../../../controllers/eventController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const { guests, plusOnes, subEventInvites } = await readBody<{
    guests: Array<{ email: string, name?: string }>
    plusOnes?: number
    subEventInvites?: { subEventId: number, plusOnes: number }[]
  }>(event)

  const guestsWithPlusOnes = (guests || []).map((g) => ({
    ...g,
    plusOnes: plusOnes || 0,
  }))

  const result = await EventController.bulkInviteToEvent(
    eventId,
    userId,
    guestsWithPlusOnes,
    subEventInvites || []
  )

  setResponseStatus(event, 201)
  return result
})
