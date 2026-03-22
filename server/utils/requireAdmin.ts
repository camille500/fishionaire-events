import type { H3Event } from 'h3'
import UserRepository from '../repositories/userRepository'
import type User from '../entities/User'

export async function requireAdmin(event: H3Event): Promise<User> {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = await UserRepository.findByClerkId(userId)

  if (!user || !user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return user
}
