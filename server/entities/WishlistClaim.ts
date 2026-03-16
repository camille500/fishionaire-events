export interface WishlistClaimData {
  id: string | null
  wishlistItemId: string
  guestEmail: string
  guestName: string | null
  amountCents: number | null
  message: string | null
  status: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface WishlistClaimJSON {
  id?: string | null
  wishlistItemId?: string
  wishlist_item_id?: string
  guestEmail?: string
  guest_email?: string
  guestName?: string | null
  guest_name?: string | null
  amountCents?: number | null
  amount_cents?: number | null
  message?: string | null
  status?: string
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class WishlistClaim {
  id: string | null
  wishlistItemId: string
  guestEmail: string
  guestName: string | null
  amountCents: number | null
  message: string | null
  status: string
  createdAt: Date | string
  updatedAt: Date | string

  constructor(data: WishlistClaimData) {
    this.id = data.id || null
    this.wishlistItemId = data.wishlistItemId
    this.guestEmail = data.guestEmail
    this.guestName = data.guestName || null
    this.amountCents = data.amountCents ?? null
    this.message = data.message || null
    this.status = data.status || 'claimed'
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: WishlistClaimJSON): WishlistClaim {
    return new WishlistClaim({
      id: data.id ?? null,
      wishlistItemId: (data.wishlistItemId || data.wishlist_item_id)!,
      guestEmail: (data.guestEmail || data.guest_email)!,
      guestName: data.guestName ?? data.guest_name ?? null,
      amountCents: data.amountCents ?? data.amount_cents ?? null,
      message: data.message ?? null,
      status: data.status || 'claimed',
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): WishlistClaimData {
    return {
      id: this.id,
      wishlistItemId: this.wishlistItemId,
      guestEmail: this.guestEmail,
      guestName: this.guestName,
      amountCents: this.amountCents,
      message: this.message,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
