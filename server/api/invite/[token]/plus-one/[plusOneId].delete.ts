import type { H3Event } from 'h3'
import EventInvitationRepository from '../../../../repositories/eventInvitationRepository'
import { checkRateLimit, resetRateLimit } from '../../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  const plusOneId = parseInt(getRouterParam(event, 'plusOneId'))

  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }
  if (isNaN(plusOneId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite-plus-one-delete')

  // Verify the parent token is valid
  const parentInvitation = await EventInvitationRepository.findByAccessToken(token)
  if (!parentInvitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
  }

  resetRateLimit(ip, 'invite-plus-one-delete')

  // Verify the plus-one belongs to this parent
  const plusOneInvite = parentInvitation.plusOneInvites.find((po) => String(po.id) === String(plusOneId))
  if (!plusOneInvite) {
    throw createError({ statusCode: 404, statusMessage: 'Plus-one not found' })
  }

  await EventInvitationRepository.delete(plusOneId)
  return { success: true }
})
