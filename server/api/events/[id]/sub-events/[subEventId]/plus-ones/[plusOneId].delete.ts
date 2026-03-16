import type { H3Event } from 'h3'
import SubEventInteractionController from '../../../../../../controllers/subEventInteractionController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const subEventId = parseInt(getRouterParam(event, 'subEventId'))
  const plusOneId = parseInt(getRouterParam(event, 'plusOneId'))
  if (isNaN(subEventId) || isNaN(plusOneId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  await SubEventInteractionController.deletePlusOne(plusOneId, userId, subEventId)
  return { success: true }
})
