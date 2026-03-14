import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventType, eventDate, subEvents, language } = await readBody<{
    eventType?: string
    eventDate?: string
    subEvents?: string[]
    language?: string
  }>(event)

  return await AiSuggestionsController.suggestTimeline({
    eventType: eventType || null,
    eventDate: eventDate || null,
    subEvents: subEvents || [],
    language: language || 'en',
  })
})
