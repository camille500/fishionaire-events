import type { H3Event } from 'h3'
import SocialWallController from '../../../../../controllers/socialWallController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const postId = parseInt(getRouterParam(event, 'postId')!)
  if (isNaN(postId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid post ID' })
  }

  return SocialWallController.rejectPost(postId, userId)
})
