import { eq } from 'drizzle-orm'
import { useDatabase } from '../database'
import { users } from '../database/schema'
import User from '../entities/User'

export default class UserRepository {
  static async findByClerkId(clerkId) {
    const db = useDatabase()
    const rows = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)
    if (!rows.length) return null
    return User.fromJSON(rows[0])
  }

  static async upsert(user) {
    const db = useDatabase()
    const data = user.toJSON()
    const rows = await db
      .insert(users)
      .values({
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          updatedAt: new Date(),
        },
      })
      .returning()
    return User.fromJSON(rows[0])
  }
}
