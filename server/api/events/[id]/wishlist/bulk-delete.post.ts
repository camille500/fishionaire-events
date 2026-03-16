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

  const { ids } = await readBody<{ ids: number[] }>(event)
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'ids must be a non-empty array' })
  }

  await WishlistController.bulkDeleteItems(eventId, userId, ids)
  return { success: true }
})
