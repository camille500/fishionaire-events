import type { H3Event } from 'h3'
import EventController from '../../../controllers/eventController'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Token is required' })

  const { status } = await readBody<{ status: string }>(event)
  return EventController.rsvpByToken(token, status)
})
