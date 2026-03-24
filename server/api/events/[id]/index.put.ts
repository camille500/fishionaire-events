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

  const body = await readBody(event)

  return await EventController.updateEvent(eventId, userId, {
    title: body.title,
    description: body.description,
    eventType: body.eventType,
    eventDate: body.eventDate,
    eventEndDate: body.eventEndDate,
    location: body.location,
    locationLat: body.locationLat,
    locationLon: body.locationLon,
    isPrivate: body.isPrivate,
    rsvpEnabled: body.rsvpEnabled,
    rsvpDeadline: body.rsvpDeadline,
    guestUploadsEnabled: body.guestUploadsEnabled,
    themeColor: body.themeColor,
    themeColorSecondary: body.themeColorSecondary,
    gradientAngle: body.gradientAngle,
    fontPairing: body.fontPairing,
    cardStyle: body.cardStyle,
    welcomeMessage: body.welcomeMessage,
    heroAnimation: body.heroAnimation,
    backgroundPattern: body.backgroundPattern,
    colorMode: body.colorMode,
    hideBranding: body.hideBranding,
    features: body.features,
  })
})
