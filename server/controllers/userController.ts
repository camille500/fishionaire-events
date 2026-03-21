import User from '../entities/User'
import UserRepository, { type ProfileUpdateData } from '../repositories/userRepository'
import { uploadImage, deleteImage } from '../utils/s3'

interface SyncUserParams {
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
}

export default class UserController {
  static async syncUser({ clerkId, email, firstName, lastName }: SyncUserParams): Promise<User> {
    const user = new User({ clerkId, email, firstName, lastName, role: 'user', createdAt: new Date(), updatedAt: new Date() })
    return await UserRepository.upsert(user)
  }

  static async getUser(clerkId: string): Promise<User | null> {
    return await UserRepository.findByClerkId(clerkId)
  }

  static async updateProfile(clerkId: string, data: ProfileUpdateData) {
    if (data.bio && data.bio.length > 500) {
      throw createError({ statusCode: 400, statusMessage: 'Bio must be 500 characters or less' })
    }

    const user = await UserRepository.findByClerkId(clerkId)
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const updated = await UserRepository.updateProfile(clerkId, data)
    return updated.toJSON()
  }

  static async uploadAvatar(clerkId: string, buffer: Buffer, contentType: string) {
    const user = await UserRepository.findByClerkId(clerkId)
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    if (user.avatarKey) {
      await deleteImage(user.avatarKey).catch(() => {})
    }

    const { key, url } = await uploadImage(buffer, contentType, 'avatars')
    await UserRepository.updateAvatar(clerkId, url, key)
    return { avatarUrl: url }
  }

  static async deleteAvatar(clerkId: string) {
    const user = await UserRepository.findByClerkId(clerkId)
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    if (user.avatarKey) {
      await deleteImage(user.avatarKey).catch(() => {})
    }

    await UserRepository.updateAvatar(clerkId, null, null)
    return { avatarUrl: null }
  }
}
