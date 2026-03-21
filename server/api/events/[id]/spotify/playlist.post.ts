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

  const { name, subEventId } = await readBody<{ name: string, subEventId: number }>(event)
  if (!name || !subEventId) {
    throw createError({ statusCode: 400, statusMessage: 'Playlist name and sub-event ID are required' })
  }

  return SpotifyController.createEventPlaylist(eventId, userId, name, subEventId)
})
