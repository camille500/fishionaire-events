import type { H3Event } from 'h3'
import UserController from '../../../controllers/userController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return await UserController.deleteAvatar(userId)
})
