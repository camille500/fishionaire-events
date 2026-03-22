import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  checkAiRateLimit(userId)

  const { eventType, context, language, eventId } = await readBody<{ eventType?: string, context?: string, language?: string, eventId?: string }>(event)

  if (context && context.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Context too long (max 2000 characters)' })
  }

  return await AiSuggestionsController.suggestTitles({
    eventType: eventType || null,
    context: context || null,
    language: language || 'en',
    clerkId: userId,
    eventId,
  })
})
