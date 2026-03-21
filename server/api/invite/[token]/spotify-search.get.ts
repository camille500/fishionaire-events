import type { H3Event } from 'h3'
import EventInvitationRepository from '../../../repositories/eventInvitationRepository'
import SpotifyController from '../../../controllers/spotifyController'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const invitation = await EventInvitationRepository.findByAccessToken(token)
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
  }

  const q = getQuery(event).q as string
  return SpotifyController.search(q)
})
