import type { H3Event } from 'h3'
import NotificationController from '../../controllers/notificationController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await NotificationController.markAllRead(userId)
  return { success: true }
})
