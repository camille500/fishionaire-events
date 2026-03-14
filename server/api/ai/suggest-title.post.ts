import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { eventType, context, language } = await readBody(event)

  return await AiSuggestionsController.suggestTitles({
    eventType: eventType || null,
    context: context || null,
    language: language || 'en',
  })
})
