import type { H3Event } from 'h3'
import SubEventInteractionController from '../../../../../../../controllers/subEventInteractionController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const requestId = parseInt(getRouterParam(event, 'requestId'))
  if (isNaN(requestId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request ID' })
  }

  return SubEventInteractionController.upvoteMusicRequest(requestId)
})
