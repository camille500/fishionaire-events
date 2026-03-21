import { usePrisma } from '../database'
import WishlistItem from '../entities/WishlistItem'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export default class WishlistItemRepository {
  static async create(item: WishlistItem): Promise<WishlistItem> {
    const prisma = usePrisma()
    const data = item.toJSON()
    const row = await prisma.wishlistItem.create({
      data: {
        eventId: toInt(data.eventId),
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        imageKey: data.imageKey,
        externalUrl: data.externalUrl,
        externalProductId: data.externalProductId,
        provider: data.provider,
        priceCents: data.priceCents,
        currency: data.currency,
        category: data.category,
        priority: data.priority,
        sortOrder: data.sortOrder,
        isPoolable: data.isPoolable,
        poolTargetCents: data.poolTargetCents,
      },
    })
    return WishlistItem.fromJSON(row)
  }

  static async findByEventId(eventId: string | number): Promise<WishlistItem[]> {
    const prisma = usePrisma()
    const rows = await prisma.wishlistItem.findMany({
      where: { eventId: toInt(eventId) },
      orderBy: { sortOrder: 'asc' },
    })
    return rows.map((row) => WishlistItem.fromJSON(row))
  }

  static async findByEventIdWithClaims(eventId: string | number): Promise<{ item: WishlistItem, claimCount: number, pooledCents: number, claims: Array<{ guestName: string | null, amountCents: number | null, status: string, createdAt: Date }> }[]> {
    const prisma = usePrisma()
    const rows = await prisma.wishlistItem.findMany({
      where: { eventId: toInt(eventId) },
      orderBy: { sortOrder: 'asc' },
      include: {
        claims: {
          select: {
            id: true,
            guestName: true,
            amountCents: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return rows.map((row) => ({
      item: WishlistItem.fromJSON(row),
      claimCount: row.claims.length,
      pooledCents: row.claims.reduce((sum, c) => sum + (c.amountCents || 0), 0),
      claims: row.claims.map((c) => ({
        guestName: c.guestName,
        amountCents: c.amountCents,
        status: c.status,
        createdAt: c.createdAt,
      })),
    }))
  }

  static async findById(id: string | number): Promise<WishlistItem | null> {
    const prisma = usePrisma()
    const row = await prisma.wishlistItem.findUnique({ where: { id: toInt(id) } })
    if (!row) return null
    return WishlistItem.fromJSON(row)
  }

  static async findByIdWithClaims(id: string | number): Promise<{ item: WishlistItem, claimCount: number, pooledCents: number, claims: Array<{ guestEmail: string, guestName: string | null, amountCents: number | null, message: string | null, status: string }> } | null> {
    const prisma = usePrisma()
    const row = await prisma.wishlistItem.findUnique({
      where: { id: toInt(id) },
      include: {
        claims: true,
      },
    })
    if (!row) return null
    return {
      item: WishlistItem.fromJSON(row),
      claimCount: row.claims.length,
      pooledCents: row.claims.reduce((sum, c) => sum + (c.amountCents || 0), 0),
      claims: row.claims.map((c) => ({
        guestEmail: c.guestEmail,
        guestName: c.guestName,
        amountCents: c.amountCents,
        message: c.message,
        status: c.status,
      })),
    }
  }

  static async update(item: WishlistItem): Promise<WishlistItem> {
    const prisma = usePrisma()
    const data = item.toJSON()
    const row = await prisma.wishlistItem.update({
      where: { id: toInt(data.id!) },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        imageKey: data.imageKey,
        externalUrl: data.externalUrl,
        externalProductId: data.externalProductId,
        provider: data.provider,
        priceCents: data.priceCents,
        currency: data.currency,
        category: data.category,
        priority: data.priority,
        sortOrder: data.sortOrder,
        isPoolable: data.isPoolable,
        poolTargetCents: data.poolTargetCents,
        updatedAt: new Date(),
      },
    })
    return WishlistItem.fromJSON(row)
  }

  static async delete(id: string | number): Promise<void> {
    const prisma = usePrisma()
    await prisma.wishlistItem.delete({ where: { id: toInt(id) } })
  }

  static async bulkDelete(ids: (string | number)[]): Promise<void> {
    const prisma = usePrisma()
    await prisma.wishlistItem.deleteMany({ where: { id: { in: ids.map(toInt) } } })
  }

  static async reorder(eventId: string | number, orderedIds: (string | number)[]): Promise<void> {
    const prisma = usePrisma()
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.wishlistItem.update({
          where: { id: toInt(id) },
          data: { sortOrder: index },
        })
      )
    )
  }

  static async getStatsForEvent(eventId: string | number): Promise<{ totalItems: number, claimedItems: number, totalPooledCents: number }> {
    const prisma = usePrisma()
    const items = await prisma.wishlistItem.findMany({
      where: { eventId: toInt(eventId) },
      include: {
        _count: { select: { claims: true } },
        claims: { select: { amountCents: true } },
      },
    })
    let claimedItems = 0
    let totalPooledCents = 0
    for (const item of items) {
      if (item._count.claims > 0) claimedItems++
      totalPooledCents += item.claims.reduce((sum, c) => sum + (c.amountCents || 0), 0)
    }
    return { totalItems: items.length, claimedItems, totalPooledCents }
  }

  static async countByEventId(eventId: string | number): Promise<number> {
    const prisma = usePrisma()
    return prisma.wishlistItem.count({ where: { eventId: toInt(eventId) } })
  }
}
