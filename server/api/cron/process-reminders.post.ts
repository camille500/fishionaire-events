import type { H3Event } from 'h3'
import NotificationController from '../../controllers/notificationController'

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  if (authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const processed = await NotificationController.processReminders()
  return { processed }
})
