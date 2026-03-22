import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  checkAiRateLimit(userId)

  const { eventType, eventTitle, description, eventDate, existingSubEvents, language, eventId } = await readBody<{
    eventType?: string
    eventTitle?: string
    description?: string
    eventDate?: string
    existingSubEvents?: string[]
    language?: string
    eventId?: string
  }>(event)

  if (description && description.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Description too long (max 2000 characters)' })
  }

  return await AiSuggestionsController.suggestSubEvents({
    eventType: eventType || null,
    eventTitle: eventTitle || null,
    description: description || null,
    eventDate: eventDate || null,
    existingSubEvents: existingSubEvents || [],
    language: language || 'en',
    clerkId: userId,
    eventId,
  })
})
