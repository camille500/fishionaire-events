import { usePrisma } from '../database'
import Notification from '../entities/Notification'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export default class NotificationRepository {
  static async create(notification: Notification): Promise<Notification> {
    const prisma = usePrisma()
    const row = await prisma.notification.create({
      data: {
        userClerkId: notification.userClerkId,
        eventId: notification.eventId ? toInt(notification.eventId) : null,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        linkUrl: notification.linkUrl,
        metadata: notification.metadata ? JSON.parse(JSON.stringify(notification.metadata)) : undefined,
      },
    })
    return Notification.fromJSON(row as any)
  }

  static async findByUserId(
    clerkId: string,
    opts: { unreadOnly?: boolean, limit?: number, offset?: number } = {},
  ): Promise<Notification[]> {
    const prisma = usePrisma()
    const where: any = { userClerkId: clerkId }
    if (opts.unreadOnly) where.isRead = false

    const rows = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: opts.limit || 20,
      skip: opts.offset || 0,
    })
    return rows.map((row: any) => Notification.fromJSON(row))
  }

  static async countUnread(clerkId: string): Promise<number> {
    const prisma = usePrisma()
    return prisma.notification.count({
      where: { userClerkId: clerkId, isRead: false },
    })
  }

  static async markAsRead(id: number, clerkId: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.notification.updateMany({
      where: { id: toInt(id), userClerkId: clerkId },
      data: { isRead: true },
    })
  }

  static async markAllAsRead(clerkId: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.notification.updateMany({
      where: { userClerkId: clerkId, isRead: false },
      data: { isRead: true },
    })
  }

  static async deleteOlderThan(days: number): Promise<number> {
    const prisma = usePrisma()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const result = await prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
    return result.count
  }
}
