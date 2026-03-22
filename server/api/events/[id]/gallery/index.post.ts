import type { H3Event } from 'h3'
import GalleryController from '../../../../controllers/galleryController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

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

  return GalleryController.uploadPhoto(eventId, userId, file.data, file.type!, caption)
})
