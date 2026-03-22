import type { H3Event } from 'h3'
import NotificationController from '../../controllers/notificationController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid notification ID' })
  }

  await NotificationController.markRead(id, userId)
  return { success: true }
})
