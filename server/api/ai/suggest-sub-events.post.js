import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventType, eventTitle, existingSubEvents, language } = await readBody(event)

  return await AiSuggestionsController.suggestSubEvents({
    eventType: eventType || null,
    eventTitle: eventTitle || null,
    existingSubEvents: existingSubEvents || [],
    language: language || 'en',
  })
})
