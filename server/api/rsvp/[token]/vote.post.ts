import type { H3Event } from 'h3'
import EventInvitationRepository from '../../../repositories/eventInvitationRepository'
import DatePollController from '../../../controllers/datePollController'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Token is required' })

  const invitation = await EventInvitationRepository.findByAccessToken(token)
  if (!invitation) throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })

  const { votes } = await readBody<{
    votes: Array<{ optionId: string, status: string, attendFrom?: string | null, attendUntil?: string | null }>
  }>(event)

  return DatePollController.submitVotesByToken(invitation.eventId, token, votes)
})
