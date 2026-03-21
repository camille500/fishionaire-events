import type { H3Event } from 'h3'
import SpotifyController from '../../../../controllers/spotifyController'

export default defineEventHandler(async (event: H3Event) => {
  const { userId, isAuthenticated } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const { requestId } = await readBody<{ requestId: number }>(event)
  if (!requestId) {
    throw createError({ statusCode: 400, statusMessage: 'Request ID is required' })
  }

  await SpotifyController.addTrackToQueue(eventId, userId, requestId)
  return { success: true }
})
