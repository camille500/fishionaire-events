import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventType, context, language, eventId } = await readBody<{ eventType?: string, context?: string, language?: string, eventId?: string }>(event)

  return await AiSuggestionsController.suggestTitles({
    eventType: eventType || null,
    context: context || null,
    language: language || 'en',
    clerkId: userId,
    eventId,
  })
})
