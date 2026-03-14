import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventType, eventDate, subEvents, language } = await readBody(event)

  return await AiSuggestionsController.suggestTimeline({
    eventType: eventType || null,
    eventDate: eventDate || null,
    subEvents: subEvents || [],
    language: language || 'en',
  })
})
