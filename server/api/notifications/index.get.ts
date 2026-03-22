import type { H3Event } from 'h3'
import NotificationController from '../../controllers/notificationController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  return NotificationController.getForUser(userId, {
    limit: Number(query.limit) || 20,
    offset: Number(query.offset) || 0,
    unreadOnly: query.unreadOnly === 'true',
  })
})
