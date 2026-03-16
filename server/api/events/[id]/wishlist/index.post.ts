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

  const body = await readBody(event)
  const result = await WishlistController.createItem(eventId, userId, body)

  setResponseStatus(event, 201)
  return result
})
