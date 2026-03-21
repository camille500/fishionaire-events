import type { H3Event } from 'h3'
import SpotifyController from '../../controllers/spotifyController'

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const error = query.error as string

  if (error) {
    const config = useRuntimeConfig()
    return sendRedirect(event, `${config.public.appUrl}/dashboard?spotify=error`)
  }

  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: 'Missing code or state parameter' })
  }

  const { eventId } = await SpotifyController.handleCallback(code, state)
  const config = useRuntimeConfig()
  return sendRedirect(event, `${config.public.appUrl}/dashboard/events/${eventId}?spotify=connected`)
})
