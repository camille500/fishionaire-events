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

  const body = await readBody(event)
  if (!Array.isArray(body?.orderedIds)) {
    throw createError({ statusCode: 400, statusMessage: 'orderedIds array is required' })
  }

  return GalleryController.reorderPhotos(eventId, userId, body.orderedIds)
})
