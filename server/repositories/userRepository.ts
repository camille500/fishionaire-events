import { usePrisma } from '../database'
import User from '../entities/User'

export interface ProfileUpdateData {
  displayName?: string | null
  bio?: string | null
  website?: string | null
  socialInstagram?: string | null
  socialTwitter?: string | null
  socialLinkedin?: string | null
  profileVisible?: boolean
}

export default class UserRepository {
  static async findByClerkId(clerkId: string): Promise<User | null> {
    const prisma = usePrisma()
    const row = await prisma.user.findUnique({ where: { clerkId } })
    if (!row) return null
    return User.fromJSON(row)
  }

  static async upsert(user: User): Promise<User> {
    const data = user.toJSON()
    const prisma = usePrisma()
    const row = await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      create: {
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
        aiTone: data.aiTone,
        aiToneCustom: data.aiToneCustom,
        aiExtraContext: data.aiExtraContext,
        updatedAt: new Date(),
      },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        updatedAt: new Date(),
      },
    })
    return User.fromJSON(row)
  }

  static async updateLlmSettings(clerkId: string, settings: { aiTone?: string | null, aiToneCustom?: string | null, aiExtraContext?: string | null }): Promise<User> {
    const prisma = usePrisma()
    const row = await prisma.user.update({
      where: { clerkId },
      data: {
        aiTone: settings.aiTone,
        aiToneCustom: settings.aiToneCustom,
        aiExtraContext: settings.aiExtraContext,
        updatedAt: new Date(),
      },
    })
    return User.fromJSON(row)
  }

  static async updateProfile(clerkId: string, profile: ProfileUpdateData): Promise<User> {
    const prisma = usePrisma()
    const row = await prisma.user.update({
      where: { clerkId },
      data: {
        displayName: profile.displayName,
        bio: profile.bio,
        website: profile.website,
        socialInstagram: profile.socialInstagram,
        socialTwitter: profile.socialTwitter,
        socialLinkedin: profile.socialLinkedin,
        profileVisible: profile.profileVisible,
        updatedAt: new Date(),
      },
    })
    return User.fromJSON(row)
  }

  static async updateAvatar(clerkId: string, avatarUrl: string | null, avatarKey: string | null): Promise<User> {
    const prisma = usePrisma()
    const row = await prisma.user.update({
      where: { clerkId },
      data: {
        avatarUrl,
        avatarKey,
        updatedAt: new Date(),
      },
    })
    return User.fromJSON(row)
  }
}
