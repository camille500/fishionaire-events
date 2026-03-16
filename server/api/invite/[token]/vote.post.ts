import type { H3Event } from 'h3'
import DatePollController from '../../../controllers/datePollController'
import EventInvitationRepository from '../../../repositories/eventInvitationRepository'
import { checkRateLimit, resetRateLimit } from '../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite-vote')

  const invitation = await EventInvitationRepository.findByAccessToken(token)
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
  }

  resetRateLimit(ip, 'invite-vote')

  const { votes } = await readBody<{
    votes: { optionId: string, status: string }[]
  }>(event)

  return await DatePollController.submitVotesByToken(
    parseInt(invitation.eventId),
    token,
    votes
  )
})
