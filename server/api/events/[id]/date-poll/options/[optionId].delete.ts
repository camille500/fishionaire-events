import type { H3Event } from 'h3'
import DatePollController from '../../../../../controllers/datePollController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const optionId = parseInt(getRouterParam(event, 'optionId'))
  if (isNaN(optionId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid option ID' })
  }

  await DatePollController.removeOption(eventId, userId, optionId)
  return { success: true }
})
