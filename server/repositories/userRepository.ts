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

  static async findAll(options: { search?: string, role?: string, offset: number, limit: number }): Promise<{ users: User[], total: number }> {
    const prisma = usePrisma()
    const where: Record<string, unknown> = {}

    if (options.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { displayName: { contains: options.search, mode: 'insensitive' } },
      ]
    }

    if (options.role) {
      where.role = options.role
    }

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options.offset,
        take: options.limit,
      }),
      prisma.user.count({ where }),
    ])

    return { users: rows.map((row: any) => User.fromJSON(row)), total }
  }

  static async updateRole(clerkId: string, role: string): Promise<User> {
    const prisma = usePrisma()
    const row = await prisma.user.update({
      where: { clerkId },
      data: { role: role as any, updatedAt: new Date() },
    })
    return User.fromJSON(row)
  }

  static async countAll(): Promise<number> {
    const prisma = usePrisma()
    return prisma.user.count()
  }

  static async countGroupedByDate(days: number = 30): Promise<{ date: string, count: number }[]> {
    const prisma = usePrisma()
    const since = new Date()
    since.setDate(since.getDate() - days)

    const rows = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM users
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
    return (rows as { date: string, count: number }[]).map((r) => ({ date: r.date, count: r.count }))
  }
}
