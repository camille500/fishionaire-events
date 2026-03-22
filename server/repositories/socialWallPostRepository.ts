import { usePrisma } from '../database'
import SocialWallPost from '../entities/SocialWallPost'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export default class SocialWallPostRepository {
  static async create(post: SocialWallPost): Promise<SocialWallPost> {
    const prisma = usePrisma()
    const row = await prisma.socialWallPost.create({
      data: {
        eventId: toInt(post.eventId),
        guestEmail: post.guestEmail,
        guestName: post.guestName,
        content: post.content,
        imageUrl: post.imageUrl,
        imageKey: post.imageKey,
        status: post.status as any,
        hearts: post.hearts,
      },
    })
    return SocialWallPost.fromJSON(row as any)
  }

  static async findByEventId(eventId: number, status?: string): Promise<SocialWallPost[]> {
    const prisma = usePrisma()
    const where: any = { eventId: toInt(eventId) }
    if (status) where.status = status

    const rows = await prisma.socialWallPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row: any) => SocialWallPost.fromJSON(row))
  }

  static async findById(id: number): Promise<SocialWallPost | null> {
    const prisma = usePrisma()
    const row = await prisma.socialWallPost.findUnique({
      where: { id: toInt(id) },
    })
    return row ? SocialWallPost.fromJSON(row as any) : null
  }

  static async updateStatus(id: number, status: string): Promise<SocialWallPost> {
    const prisma = usePrisma()
    const row = await prisma.socialWallPost.update({
      where: { id: toInt(id) },
      data: { status: status as any, updatedAt: new Date() },
    })
    return SocialWallPost.fromJSON(row as any)
  }

  static async incrementHearts(id: number): Promise<SocialWallPost> {
    const prisma = usePrisma()
    const row = await prisma.socialWallPost.update({
      where: { id: toInt(id) },
      data: { hearts: { increment: 1 } },
    })
    return SocialWallPost.fromJSON(row as any)
  }

  static async delete(id: number): Promise<void> {
    const prisma = usePrisma()
    await prisma.socialWallPost.delete({ where: { id: toInt(id) } })
  }

  static async countByEventId(eventId: number, status?: string): Promise<number> {
    const prisma = usePrisma()
    const where: any = { eventId: toInt(eventId) }
    if (status) where.status = status
    return prisma.socialWallPost.count({ where })
  }
}
