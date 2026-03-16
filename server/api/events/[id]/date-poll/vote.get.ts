import type { H3Event } from 'h3'
import DatePollController from '../../../../controllers/datePollController'

export default defineEventHandler(async (event: H3Event) => {
  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const query = getQuery(event)
  const email = query.email ? String(query.email) : undefined

  return DatePollController.getPublicPoll(eventId, email)
})
