import type { H3Event } from 'h3'
import EventInvitationRepository from '../../../repositories/eventInvitationRepository'
import SubEventInteractionController from '../../../controllers/subEventInteractionController'
import { checkRateLimit, resetRateLimit } from '../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite-music')

  const invitation = await EventInvitationRepository.findByAccessToken(token)
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
  }

  const { subEventId, songTitle, artist, spotifyTrackId, spotifyUri, albumArtUrl, previewUrl, durationMs } = await readBody<{
    subEventId: number
    songTitle: string
    artist?: string
    spotifyTrackId?: string
    spotifyUri?: string
    albumArtUrl?: string
    previewUrl?: string
    durationMs?: number
  }>(event)

  if (!subEventId) {
    throw createError({ statusCode: 400, statusMessage: 'Sub-event ID is required' })
  }

  const result = await SubEventInteractionController.submitMusicRequest(subEventId, invitation.inviteeEmail, {
    songTitle,
    artist,
    spotifyTrackId,
    spotifyUri,
    albumArtUrl,
    previewUrl,
    durationMs,
  })

  resetRateLimit(ip, 'invite-music')
  setResponseStatus(event, 201)
  return result
})
