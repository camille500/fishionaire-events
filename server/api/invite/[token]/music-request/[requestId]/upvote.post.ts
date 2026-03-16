import type { H3Event } from 'h3'
import EventInvitationRepository from '../../../../../repositories/eventInvitationRepository'
import SubEventInteractionController from '../../../../../controllers/subEventInteractionController'
import { checkRateLimit, resetRateLimit } from '../../../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite-music-upvote')

  const invitation = await EventInvitationRepository.findByAccessToken(token)
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
  }

  const requestId = parseInt(getRouterParam(event, 'requestId'))
  if (isNaN(requestId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request ID' })
  }

  const result = await SubEventInteractionController.upvoteMusicRequest(requestId)
  resetRateLimit(ip, 'invite-music-upvote')
  return result
})
