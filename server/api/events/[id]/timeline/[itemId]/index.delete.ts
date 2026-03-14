import type { H3Event } from 'h3'
import TimelineController from '../../../../../controllers/timelineController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const itemId = parseInt(getRouterParam(event, 'itemId'))
  if (isNaN(itemId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid timeline item ID' })
  }

  await TimelineController.deleteItem(itemId, userId)
  return { success: true }
})
