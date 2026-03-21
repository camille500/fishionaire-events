import type { H3Event } from 'h3'
import AiSuggestionsController from '~/server/controllers/aiSuggestionsController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { messages, language } = await readBody<{
    messages: Array<{ role: 'user' | 'assistant', content: string }>
    language?: string
  }>(event)

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Messages array is required' })
  }

  if (messages.length > 30) {
    throw createError({ statusCode: 400, statusMessage: 'Too many messages' })
  }

  return await AiSuggestionsController.chatBuildEvent({
    messages,
    language: (language as 'nl' | 'en') || 'en',
    clerkId: userId,
  })
})
