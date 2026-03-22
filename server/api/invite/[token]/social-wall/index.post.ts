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

  const contentTypeHeader = getRequestHeader(event, 'content-type') || ''

  if (contentTypeHeader.includes('multipart/form-data')) {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No data provided' })
    }

    const contentField = formData.find((f) => f.name === 'content')
    if (!contentField) {
      throw createError({ statusCode: 400, statusMessage: 'Content is required' })
    }

    const content = contentField.data.toString('utf-8')
    const file = formData.find((f) => f.name === 'image')

    if (file) {
      const allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type || '')) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' })
      }

      const maxSize = 10 * 1024 * 1024
      if (file.data.length > maxSize) {
        throw createError({ statusCode: 400, statusMessage: 'File too large. Maximum 10MB' })
      }

      return SocialWallController.guestCreatePost(token, content, file.data, file.type!)
    }

    return SocialWallController.guestCreatePost(token, content)
  }

  const body = await readBody(event)
  if (!body?.content) {
    throw createError({ statusCode: 400, statusMessage: 'Content is required' })
  }

  return SocialWallController.guestCreatePost(token, body.content)
})
