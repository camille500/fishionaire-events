import { usePrisma } from '../database'
import WishlistItemMessage from '../entities/WishlistItemMessage'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export default class WishlistItemMessageRepository {
  static async create(wishlistItemId: string | number, guestEmail: string, guestName: string | null, content: string): Promise<WishlistItemMessage> {
    const prisma = usePrisma()
    const row = await prisma.wishlistItemMessage.create({
      data: {
        wishlistItemId: toInt(wishlistItemId),
        guestEmail,
        guestName: guestName || null,
        content,
      },
    })
    return WishlistItemMessage.fromJSON(row)
  }

  static async findByItemId(wishlistItemId: string | number, limit = 50): Promise<WishlistItemMessage[]> {
    const prisma = usePrisma()
    const rows = await prisma.wishlistItemMessage.findMany({
      where: { wishlistItemId: toInt(wishlistItemId) },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
    return rows.map((row) => WishlistItemMessage.fromJSON(row))
  }

  static async countByItemIds(itemIds: number[]): Promise<Record<number, number>> {
    if (itemIds.length === 0) return {}
    const prisma = usePrisma()
    const counts = await prisma.wishlistItemMessage.groupBy({
      by: ['wishlistItemId'],
      where: { wishlistItemId: { in: itemIds } },
      _count: { id: true },
    })
    const result: Record<number, number> = {}
    for (const row of counts) {
      result[row.wishlistItemId] = row._count.id
    }
    return result
  }
}
