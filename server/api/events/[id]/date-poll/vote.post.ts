import type { H3Event } from 'h3'
import DatePollController from '../../../../controllers/datePollController'

export default defineEventHandler(async (event: H3Event) => {
  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const body = await readBody(event)

  if (!body.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  if (!Array.isArray(body.votes) || body.votes.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Votes array is required' })
  }

  return DatePollController.submitVotes(eventId, body.email, body.name || null, body.votes)
})
