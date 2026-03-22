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

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = formData.find((f) => f.name === 'image')
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'No image field found' })
  }

  const allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type || '')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' })
  }

  const maxSize = 10 * 1024 * 1024
  if (file.data.length > maxSize) {
    throw createError({ statusCode: 400, statusMessage: 'File too large. Maximum 10MB' })
  }

  const captionField = formData.find((f) => f.name === 'caption')
  const caption = captionField?.data?.toString('utf-8') || undefined

  return GalleryController.guestUploadPhoto(token, file.data, file.type!, caption)
})
