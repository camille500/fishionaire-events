import User from '../entities/User'
import UserRepository from '../repositories/userRepository'

export default class UserController {
  static async syncUser({ clerkId, email, firstName, lastName }) {
    const user = new User({ clerkId, email, firstName, lastName })
    return await UserRepository.upsert(user)
  }

  static async getUser(clerkId) {
    return await UserRepository.findByClerkId(clerkId)
  }
}
