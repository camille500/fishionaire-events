import { usePrisma } from '../database'
import User from '../entities/User'

export default class UserRepository {
  static async findByClerkId(clerkId) {
    const prisma = usePrisma()
    const row = await prisma.user.findUnique({ where: { clerkId } })
    if (!row) return null
    return User.fromJSON(row)
  }

  static async upsert(user) {
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
}
