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

  const { email } = await readBody(event)
  const result = await EventController.inviteToEvent(eventId, userId, email)

  setResponseStatus(event, 201)
  return result
})
