import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'
import SubscriptionController from '~/server/controllers/subscriptionController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  checkAiRateLimit(userId)
  await checkAiTokenLimit(userId)

  const { description, language } = await readBody<{ description: string, language?: string }>(event)

  if (!description || !description.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Description is required' })
  }

  if (description.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Description too long (max 2000 characters)' })
  }

  const result = await AiSuggestionsController.buildEvent({
    description: description.trim(),
    language: language || 'en',
    clerkId: userId,
  })

  await recordAiTokens(userId, result.tokensUsed)
  return result
})
