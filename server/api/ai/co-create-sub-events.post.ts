import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  checkAiRateLimit(userId)
  await checkAiTokenLimit(userId)

  const { eventType, eventTitle, userPrompt, existingSubEvents, language, eventId } = await readBody<{
    eventType?: string
    eventTitle?: string
    userPrompt: string
    existingSubEvents?: Array<{ title: string }>
    language?: string
    eventId?: string
  }>(event)

  if (!userPrompt || !userPrompt.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'A description is required' })
  }

  if (userPrompt.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Prompt too long (max 2000 characters)' })
  }

  const result = await AiSuggestionsController.coCreateSubEvents({
    eventType: eventType || undefined,
    eventTitle: eventTitle || undefined,
    userPrompt,
    existingSubEvents: existingSubEvents || [],
    language: (language as 'nl' | 'en') || 'en',
    clerkId: userId,
    eventId,
  })

  await recordAiTokens(userId, result.tokensUsed)
  return result
})
