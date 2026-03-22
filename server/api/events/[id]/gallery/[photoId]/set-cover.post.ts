import type { H3Event } from 'h3'
import GalleryController from '../../../../../controllers/galleryController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const photoId = parseInt(getRouterParam(event, 'photoId')!)
  if (isNaN(photoId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid photo ID' })
  }

  return GalleryController.setAsCover(photoId, userId)
})
