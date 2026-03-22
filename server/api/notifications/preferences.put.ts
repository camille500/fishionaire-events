import type { H3Event } from 'h3'
import NotificationController from '../../controllers/notificationController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is required' })
  }

  return NotificationController.updatePreferences(userId, {
    preferences: body.preferences,
    reminderSchedule: body.reminderSchedule,
    digestEnabled: body.digestEnabled,
  })
})
