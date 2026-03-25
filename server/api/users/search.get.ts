import type { H3Event } from 'h3'
import UserController from '../../controllers/userController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const q = (query.q as string || '').trim()

  if (q.length < 2) {
    return []
  }

  return await UserController.searchUsers(q, userId)
})
