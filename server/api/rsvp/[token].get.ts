import type { H3Event } from 'h3'
import RsvpController from '../../controllers/rsvpController'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Token is required' })

  return RsvpController.getPublicRsvp(token)
})
