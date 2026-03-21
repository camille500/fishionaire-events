import type { H3Event } from 'h3'
import WishlistController from '../../../../../controllers/wishlistController'
import { checkRateLimit } from '../../../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const itemId = parseInt(getRouterParam(event, 'itemId')!)
  if (isNaN(itemId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid item ID' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite-chat')

  const body = await readBody(event)
  return WishlistController.sendItemMessage(token, itemId, body?.content)
})
