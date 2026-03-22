import type { H3Event } from 'h3'
import GalleryController from '../../../../controllers/galleryController'
import { checkRateLimit } from '../../../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  checkRateLimit(ip, 'invite')

  return GalleryController.getGuestGallery(token)
})
