import type { H3Event } from 'h3'
import EventController from '../../../controllers/eventController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const { title, description, eventType, eventDate, eventEndDate, location, maxGuests, isPrivate, features } = await readBody<{
    title?: string
    description?: string
    eventType?: string
    eventDate?: string
    eventEndDate?: string
    location?: string
    maxGuests?: number
    isPrivate?: boolean
    features?: Record<string, boolean>
  }>(event)
  return await EventController.updateEvent(eventId, userId, { title, description, eventType, eventDate, eventEndDate, location, maxGuests, isPrivate, features })
})
