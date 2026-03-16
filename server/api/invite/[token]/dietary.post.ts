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
  checkRateLimit(ip, 'invite-dietary')

  const invitation = await EventInvitationRepository.findByAccessToken(token)
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
  }

  const { subEventId, restrictions, notes } = await readBody<{
    subEventId: number
    restrictions: string
    notes?: string
  }>(event)

  if (!subEventId) {
    throw createError({ statusCode: 400, statusMessage: 'Sub-event ID is required' })
  }

  const result = await SubEventInteractionController.submitDietary(subEventId, invitation.inviteeEmail, {
    guestName: invitation.inviteeName,
    restrictions,
    notes,
  })

  resetRateLimit(ip, 'invite-dietary')
  setResponseStatus(event, 201)
  return result
})
