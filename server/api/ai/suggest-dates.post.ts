import type { H3Event } from 'h3'
import AiDateController from '../../controllers/aiDateController'
import { checkAiRateLimit } from '../../utils/rateLimiter'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  checkAiRateLimit(userId)
  await checkAiTokenLimit(userId)

  const { prompt, language } = await readBody<{ prompt: string, language?: string }>(event)
  const result = await AiDateController.suggestDates(prompt, language || 'nl')

  await recordAiTokens(userId, result.tokensUsed)
  return result
})
