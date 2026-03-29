import type { H3Event } from 'h3'
import AiTokenUsageController from '~/server/controllers/aiTokenUsageController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return AiTokenUsageController.getUsage(userId)
})
