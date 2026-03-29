import type { H3Event } from 'h3'
import WishlistAiController from '../../../../controllers/wishlistAiController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  checkAiRateLimit(userId)
  await checkAiTokenLimit(userId)

  const eventId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!body.prompt || !body.prompt.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Prompt is required' })
  }

  const result = await WishlistAiController.suggestPresents({
    eventType: body.eventType,
    eventTitle: body.eventTitle,
    prompt: body.prompt.trim(),
    existingItems: body.existingItems || [],
    language: body.language || 'nl',
    clerkId: userId,
    eventId,
  })

  await recordAiTokens(userId, result.tokensUsed)
  return result
})
