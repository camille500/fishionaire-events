import type { H3Event } from 'h3'
import WishlistController from '../../../../../controllers/wishlistController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const itemId = parseInt(getRouterParam(event, 'itemId'))
  if (isNaN(itemId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid item ID' })
  }

  await WishlistController.deleteItem(itemId, userId)
  setResponseStatus(event, 204)
  return null
})
