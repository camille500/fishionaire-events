import type { H3Event } from 'h3'
import EventTemplateController from '../../controllers/eventTemplateController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return EventTemplateController.listTemplates(userId)
})
