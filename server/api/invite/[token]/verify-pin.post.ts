import type { H3Event } from 'h3'
import EventInvitationRepository from '../../../repositories/eventInvitationRepository'
import { checkRateLimit } from '../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite')

  const body = await readBody(event)
  const pin = String(body?.pin || '').trim()

  if (!pin || pin.length !== 6) {
    throw createError({ statusCode: 400, statusMessage: 'PIN must be 6 digits' })
  }

  const invitation = await EventInvitationRepository.findByAccessToken(token)
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
  }

  if (!invitation.pinCode) {
    // No PIN set — allow through
    return { verified: true }
  }

  if (invitation.pinCode !== pin) {
    throw createError({ statusCode: 403, statusMessage: 'Incorrect PIN' })
  }

  return { verified: true }
})
