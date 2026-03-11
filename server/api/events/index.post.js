import EventController from '../../controllers/eventController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { title, tier } = await readBody(event)
  const result = await EventController.createEvent(userId, title, tier)

  setResponseStatus(event, 201)
  return result
})
