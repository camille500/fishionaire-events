import { usePrisma } from '../database'
import User from '../entities/User'

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
        role: data.role,
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
}
