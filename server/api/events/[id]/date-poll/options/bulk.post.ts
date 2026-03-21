import type { H3Event } from 'h3'
import DatePollController from '../../../../../controllers/datePollController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id') || '')
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const { options } = await readBody(event)
  const result = await DatePollController.addOptions(eventId, userId, options)

  setResponseStatus(event, 201)
  return result
})
