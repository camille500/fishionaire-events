import { usePrisma } from '../database'
import WishlistClaim from '../entities/WishlistClaim'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export default class WishlistClaimRepository {
  static async upsert(wishlistItemId: string | number, guestEmail: string, data: { guestName?: string | null, amountCents?: number | null, message?: string | null, status?: string }): Promise<WishlistClaim> {
    const prisma = usePrisma()
    const itemId = toInt(wishlistItemId)
    const row = await prisma.wishlistClaim.upsert({
      where: {
        wishlistItemId_guestEmail: { wishlistItemId: itemId, guestEmail },
      },
      create: {
        wishlistItemId: itemId,
        guestEmail,
        guestName: data.guestName || null,
        amountCents: data.amountCents ?? null,
        message: data.message || null,
        status: data.status || 'claimed',
      },
      update: {
        guestName: data.guestName || undefined,
        amountCents: data.amountCents ?? undefined,
        message: data.message !== undefined ? data.message : undefined,
        status: data.status || undefined,
        updatedAt: new Date(),
      },
    })
    return WishlistClaim.fromJSON(row)
  }

  static async findByItemId(wishlistItemId: string | number): Promise<WishlistClaim[]> {
    const prisma = usePrisma()
    const rows = await prisma.wishlistClaim.findMany({
      where: { wishlistItemId: toInt(wishlistItemId) },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => WishlistClaim.fromJSON(row))
  }

  static async findByItemAndGuest(wishlistItemId: string | number, guestEmail: string): Promise<WishlistClaim | null> {
    const prisma = usePrisma()
    const row = await prisma.wishlistClaim.findUnique({
      where: {
        wishlistItemId_guestEmail: { wishlistItemId: toInt(wishlistItemId), guestEmail },
      },
    })
    if (!row) return null
    return WishlistClaim.fromJSON(row)
  }

  static async findByEventAndGuest(eventId: string | number, guestEmail: string): Promise<WishlistClaim[]> {
    const prisma = usePrisma()
    const rows = await prisma.wishlistClaim.findMany({
      where: {
        guestEmail,
        wishlistItem: { eventId: toInt(eventId) },
      },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => WishlistClaim.fromJSON(row))
  }

  static async delete(id: string | number): Promise<void> {
    const prisma = usePrisma()
    await prisma.wishlistClaim.delete({ where: { id: toInt(id) } })
  }

  static async deleteByItemAndGuest(wishlistItemId: string | number, guestEmail: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.wishlistClaim.delete({
      where: {
        wishlistItemId_guestEmail: { wishlistItemId: toInt(wishlistItemId), guestEmail },
      },
    })
  }
}
