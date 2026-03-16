import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'
import SubscriptionController from '~/server/controllers/subscriptionController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { description, language } = await readBody<{ description: string, language?: string }>(event)

  if (!description || !description.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Description is required' })
  }

  return await AiSuggestionsController.buildEvent({
    description: description.trim(),
    language: language || 'en',
    clerkId: userId,
  })
})
