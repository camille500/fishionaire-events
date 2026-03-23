import type { H3Event } from 'h3'
import CheckInController from '../../../../controllers/checkInController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const body = await readBody<{ accessToken: string }>(event)
  if (!body.accessToken || body.accessToken.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid access token' })
  }

  const result = await CheckInController.checkInByToken(eventId, body.accessToken, userId)
  setResponseStatus(event, 201)
  return result
})
