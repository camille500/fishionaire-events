import type { H3Event } from 'h3'
import EventController from '../../../controllers/eventController'
import { checkRateLimit, resetRateLimit } from '../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite-rsvp')

  const { status } = await readBody<{ status: string }>(event)

  try {
    const result = await EventController.rsvpByToken(token, status)
    resetRateLimit(ip, 'invite-rsvp')
    return result
  } catch (e) {
    throw e
  }
})
