import EventTemplateController from '../../controllers/eventTemplateController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventId, name } = await readBody(event)
  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Event ID is required' })
  }

  const result = await EventTemplateController.saveAsTemplate(eventId, userId, name)

  setResponseStatus(event, 201)
  return result
})
