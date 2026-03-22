import type { H3Event } from 'h3'
import SocialWallController from '../../../../controllers/socialWallController'
import { checkRateLimit } from '../../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite')

  return SocialWallController.getGuestWall(token)
})
