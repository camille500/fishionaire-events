import type { H3Event } from 'h3'
import SubEventController from '../../../../../controllers/subEventController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const subEventId = parseInt(getRouterParam(event, 'subEventId'))
  if (isNaN(subEventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sub-event ID' })
  }

  const body = await readBody(event)
  return SubEventController.updateTypeConfig(subEventId, userId, body)
})
