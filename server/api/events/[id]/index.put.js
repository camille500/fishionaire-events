import EventController from '../../../controllers/eventController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const { title, description, features } = await readBody(event)
  return await EventController.updateEvent(eventId, userId, { title, description, features })
})
