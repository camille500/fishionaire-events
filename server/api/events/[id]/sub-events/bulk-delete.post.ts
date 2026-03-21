import type { H3Event } from 'h3'
import SubEventController from '../../../../controllers/subEventController'

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
  const { ids } = body

  await SubEventController.bulkDeleteSubEvents(eventId, userId, ids)
  return { success: true }
})
