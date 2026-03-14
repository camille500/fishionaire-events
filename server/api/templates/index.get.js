import EventTemplateController from '../../controllers/eventTemplateController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return EventTemplateController.listTemplates(userId)
})
