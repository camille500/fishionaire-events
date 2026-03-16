import type { H3Event } from 'h3'
import DatePollController from '../../../../controllers/datePollController'

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
  if (!body.optionId) {
    throw createError({ statusCode: 400, statusMessage: 'optionId is required' })
  }

  return DatePollController.setOfficialDate(eventId, userId, parseInt(body.optionId))
})
