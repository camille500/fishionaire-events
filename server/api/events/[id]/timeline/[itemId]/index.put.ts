import TimelineController from '../../../../../controllers/timelineController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const itemId = parseInt(getRouterParam(event, 'itemId'))
  if (isNaN(itemId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid timeline item ID' })
  }

  const body = await readBody(event)
  return TimelineController.updateItem(itemId, userId, body)
})
