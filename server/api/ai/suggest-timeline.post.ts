import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  checkAiRateLimit(userId)
  await checkAiTokenLimit(userId)

  const { eventType, eventDate, subEvents, language, eventId } = await readBody<{
    eventType?: string
    eventDate?: string
    subEvents?: string[]
    language?: string
    eventId?: string
  }>(event)

  const result = await AiSuggestionsController.suggestTimeline({
    eventType: eventType || null,
    eventDate: eventDate || null,
    subEvents: subEvents || [],
    language: language || 'en',
    clerkId: userId,
    eventId,
  })

  await recordAiTokens(userId, result.tokensUsed)
  return result
})
