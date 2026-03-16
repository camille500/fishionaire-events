export interface WishlistItemData {
  id: string | null
  eventId: string
  title: string
  description: string | null
  imageUrl: string | null
  imageKey: string | null
  externalUrl: string | null
  externalProductId: string | null
  provider: string
  priceCents: number | null
  currency: string
  category: string | null
  priority: number
  sortOrder: number
  isPoolable: boolean
  poolTargetCents: number | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface WishlistItemJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  title?: string
  description?: string | null
  imageUrl?: string | null
  image_url?: string | null
  imageKey?: string | null
  image_key?: string | null
  externalUrl?: string | null
  external_url?: string | null
  externalProductId?: string | null
  external_product_id?: string | null
  provider?: string
  priceCents?: number | null
  price_cents?: number | null
  currency?: string
  category?: string | null
  priority?: number
  sortOrder?: number
  sort_order?: number
  isPoolable?: boolean
  is_poolable?: boolean
  poolTargetCents?: number | null
  pool_target_cents?: number | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class WishlistItem {
  id: string | null
  eventId: string
  title: string
  description: string | null
  imageUrl: string | null
  imageKey: string | null
  externalUrl: string | null
  externalProductId: string | null
  provider: string
  priceCents: number | null
  currency: string
  category: string | null
  priority: number
  sortOrder: number
  isPoolable: boolean
  poolTargetCents: number | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor(data: WishlistItemData) {
    this.id = data.id || null
    this.eventId = data.eventId
    this.title = data.title
    this.description = data.description || null
    this.imageUrl = data.imageUrl || null
    this.imageKey = data.imageKey || null
    this.externalUrl = data.externalUrl || null
    this.externalProductId = data.externalProductId || null
    this.provider = data.provider || 'manual'
    this.priceCents = data.priceCents ?? null
    this.currency = data.currency || 'EUR'
    this.category = data.category || null
    this.priority = data.priority || 0
    this.sortOrder = data.sortOrder || 0
    this.isPoolable = data.isPoolable || false
    this.poolTargetCents = data.poolTargetCents ?? null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: WishlistItemJSON): WishlistItem {
    return new WishlistItem({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      title: data.title || '',
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? data.image_url ?? null,
      imageKey: data.imageKey ?? data.image_key ?? null,
      externalUrl: data.externalUrl ?? data.external_url ?? null,
      externalProductId: data.externalProductId ?? data.external_product_id ?? null,
      provider: data.provider || 'manual',
      priceCents: data.priceCents ?? data.price_cents ?? null,
      currency: data.currency || 'EUR',
      category: data.category ?? null,
      priority: data.priority ?? 0,
      sortOrder: data.sortOrder ?? data.sort_order ?? 0,
      isPoolable: data.isPoolable ?? data.is_poolable ?? false,
      poolTargetCents: data.poolTargetCents ?? data.pool_target_cents ?? null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): WishlistItemData {
    return {
      id: this.id,
      eventId: this.eventId,
      title: this.title,
      description: this.description,
      imageUrl: this.imageUrl,
      imageKey: this.imageKey,
      externalUrl: this.externalUrl,
      externalProductId: this.externalProductId,
      provider: this.provider,
      priceCents: this.priceCents,
      currency: this.currency,
      category: this.category,
      priority: this.priority,
      sortOrder: this.sortOrder,
      isPoolable: this.isPoolable,
      poolTargetCents: this.poolTargetCents,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
