import type { H3Event } from 'h3'
import WishlistController from '../../../../controllers/wishlistController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const { orderedIds } = await readBody<{ orderedIds: number[] }>(event)
  if (!Array.isArray(orderedIds)) {
    throw createError({ statusCode: 400, statusMessage: 'orderedIds must be an array' })
  }

  await WishlistController.reorderItems(eventId, userId, orderedIds)
  return { success: true }
})
