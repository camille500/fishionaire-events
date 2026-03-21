import type { H3Event } from 'h3'
import SubEventInteractionController from '../../../../../../../controllers/subEventInteractionController'

export default defineEventHandler(async (event: H3Event) => {
  const { userId, isAuthenticated } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const subEventId = parseInt(getRouterParam(event, 'subEventId'))
  const requestId = parseInt(getRouterParam(event, 'requestId'))
  if (isNaN(subEventId) || isNaN(requestId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid IDs' })
  }

  return SubEventInteractionController.rejectMusicRequest(requestId, userId, subEventId)
})
