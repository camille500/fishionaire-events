import User from '../entities/User'
import UserRepository from '../repositories/userRepository'

interface SyncUserParams {
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
}

export default class UserController {
  static async syncUser({ clerkId, email, firstName, lastName }: SyncUserParams): Promise<User> {
    const user = new User({ clerkId, email, firstName, lastName })
    return await UserRepository.upsert(user)
  }

  static async getUser(clerkId: string): Promise<User | null> {
    return await UserRepository.findByClerkId(clerkId)
  }
}
