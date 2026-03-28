import type { H3Event } from 'h3'
import EventController from '../../controllers/eventController'
import { checkRateLimit, resetRateLimit } from '../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite')

  const query = getQuery(event)
  const pin = query.pin ? String(query.pin) : null

  // Try to get authenticated user for PIN bypass
  let authUserId: string | null = null
  try {
    const auth = event.context.auth?.()
    if (auth?.isAuthenticated && auth?.userId) {
      authUserId = auth.userId
    }
  } catch {
    // Not authenticated — fine
  }

  try {
    const result = await EventController.getInviteEvent(token, { pin, authUserId })
    resetRateLimit(ip, 'invite')
    return result
  } catch (e) {
    throw e
  }
})
