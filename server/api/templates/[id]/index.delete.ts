import EventTemplateController from '../../../controllers/eventTemplateController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const templateId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(templateId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid template ID' })
  }

  await EventTemplateController.deleteTemplate(templateId, userId)
  return { success: true }
})
