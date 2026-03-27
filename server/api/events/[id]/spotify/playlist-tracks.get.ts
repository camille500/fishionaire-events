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

  const playlistId = parseInt(getQuery(event).playlistId as string)
  if (isNaN(playlistId)) {
    throw createError({ statusCode: 400, statusMessage: 'Playlist ID is required' })
  }

  return SpotifyController.getPlaylistTracks(eventId, userId, playlistId)
})
