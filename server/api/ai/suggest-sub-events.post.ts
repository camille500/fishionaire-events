import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventType, eventTitle, description, eventDate, existingSubEvents, language, eventId } = await readBody<{
    eventType?: string
    eventTitle?: string
    description?: string
    eventDate?: string
    existingSubEvents?: string[]
    language?: string
    eventId?: string
  }>(event)

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
