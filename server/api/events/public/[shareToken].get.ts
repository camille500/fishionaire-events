import type { H3Event } from 'h3'
import EventController from '../../../controllers/eventController'
import { checkRateLimit, resetRateLimit } from '../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const shareToken = getRouterParam(event, 'shareToken')
  if (!shareToken || shareToken.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share token' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'public-event')

  try {
    const result = await EventController.getPublicEvent(shareToken)
    resetRateLimit(ip, 'public-event')
    return result
  } catch (e) {
    throw e
  }
})
