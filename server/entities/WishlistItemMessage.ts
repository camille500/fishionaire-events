export interface WishlistItemMessageData {
  id: number | null
  wishlistItemId: number
  guestEmail: string
  guestName: string | null
  content: string
  createdAt: Date | string
}

export interface WishlistItemMessageJSON {
  id?: number | null
  wishlistItemId?: number
  wishlist_item_id?: number
  guestEmail?: string
  guest_email?: string
  guestName?: string | null
  guest_name?: string | null
  content?: string
  createdAt?: Date | string
  created_at?: Date | string
}

export default class WishlistItemMessage {
  id: number | null
  wishlistItemId: number
  guestEmail: string
  guestName: string | null
  content: string
  createdAt: Date | string

  constructor(data: WishlistItemMessageData) {
    this.id = data.id || null
    this.wishlistItemId = data.wishlistItemId
    this.guestEmail = data.guestEmail
    this.guestName = data.guestName || null
    this.content = data.content
    this.createdAt = data.createdAt || new Date()
  }

  static fromJSON(data: WishlistItemMessageJSON): WishlistItemMessage {
    return new WishlistItemMessage({
      id: data.id ?? null,
      wishlistItemId: (data.wishlistItemId || data.wishlist_item_id)!,
      guestEmail: (data.guestEmail || data.guest_email)!,
      guestName: data.guestName ?? data.guest_name ?? null,
      content: data.content || '',
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): WishlistItemMessageData {
    return {
      id: this.id,
      wishlistItemId: this.wishlistItemId,
      guestEmail: this.guestEmail,
      guestName: this.guestName,
      content: this.content,
      createdAt: this.createdAt,
    }
  }
}
