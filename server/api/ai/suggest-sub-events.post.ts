import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventType, eventTitle, existingSubEvents, language } = await readBody<{
    eventType?: string
    eventTitle?: string
    existingSubEvents?: string[]
    language?: string
  }>(event)

  return await AiSuggestionsController.suggestSubEvents({
    eventType: eventType || null,
    eventTitle: eventTitle || null,
    existingSubEvents: existingSubEvents || [],
    language: language || 'en',
  })
})
