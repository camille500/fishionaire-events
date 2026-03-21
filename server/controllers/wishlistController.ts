import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import WishlistItemRepository from '../repositories/wishlistItemRepository'
import WishlistClaimRepository from '../repositories/wishlistClaimRepository'
import WishlistItemMessageRepository from '../repositories/wishlistItemMessageRepository'
import WishlistItem from '../entities/WishlistItem'
import { getProductSearchProvider } from '../utils/productSearch'
import ActivityLogController from './activityLogController'

interface CreateItemParams {
  title: string
  description?: string
  imageUrl?: string
  externalUrl?: string
  externalProductId?: string
  provider?: string
  priceCents?: number
  currency?: string
  category?: string
  priority?: number
  isPoolable?: boolean
  poolTargetCents?: number
}

interface UpdateItemParams {
  title?: string
  description?: string
  imageUrl?: string
  imageKey?: string
  externalUrl?: string
  priceCents?: number
  currency?: string
  category?: string
  priority?: number
  isPoolable?: boolean
  poolTargetCents?: number
}

export default class WishlistController {
  // --- Access helpers ---

  static async #verifyOrganizerAccess(eventId: number, clerkId: string) {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to manage this event' })
    }

    return event
  }

  static #checkWishlistFeature(event: { features: Record<string, unknown> }) {
    const features = event.features as Record<string, boolean>
    if (!features?.wishlist) {
      throw createError({ statusCode: 403, statusMessage: 'Wishlist is not available for this event tier' })
    }
  }

  static async #resolveGuestFromToken(accessToken: string) {
    const invitation = await EventInvitationRepository.findByAccessToken(accessToken)
    if (!invitation) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid invite link' })
    }
    return invitation
  }

  // --- Organizer methods ---

  static async listItems(eventId: number, clerkId: string): Promise<Record<string, unknown>[]> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkWishlistFeature(event)

    const rows = await WishlistItemRepository.findByEventIdWithClaims(eventId)
    return rows.map(({ item, claimCount, pooledCents, claims }) => ({
      ...item.toJSON(),
      claimCount,
      pooledCents,
      claims: claims.map((c) => ({
        guestName: c.guestName,
        amountCents: c.amountCents,
        status: c.status,
        createdAt: c.createdAt,
      })),
    }))
  }

  static async createItem(eventId: number, clerkId: string, params: CreateItemParams): Promise<Record<string, unknown>> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkWishlistFeature(event)

    if (!params.title || !params.title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    }

    const existing = await WishlistItemRepository.findByEventId(eventId)
    const sortOrder = existing.length

    const item = new WishlistItem({
      id: null,
      eventId,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      imageUrl: params.imageUrl || null,
      imageKey: null,
      externalUrl: params.externalUrl || null,
      externalProductId: params.externalProductId || null,
      provider: params.provider || 'manual',
      priceCents: params.priceCents ?? null,
      currency: params.currency || 'EUR',
      category: params.category || null,
      priority: params.priority ?? 0,
      sortOrder,
      isPoolable: params.isPoolable || false,
      poolTargetCents: params.poolTargetCents ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const created = await WishlistItemRepository.create(item)
    return { ...created.toJSON(), claimCount: 0, pooledCents: 0 }
  }

  static async updateItem(itemId: number, clerkId: string, params: UpdateItemParams): Promise<Record<string, unknown>> {
    const existing = await WishlistItemRepository.findById(itemId)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Wishlist item not found' })
    }

    const event = await this.#verifyOrganizerAccess(existing.eventId, clerkId)
    this.#checkWishlistFeature(event)

    if (params.title !== undefined) existing.title = params.title.trim()
    if (params.description !== undefined) existing.description = params.description?.trim() || null
    if (params.imageUrl !== undefined) existing.imageUrl = params.imageUrl || null
    if (params.imageKey !== undefined) existing.imageKey = params.imageKey || null
    if (params.externalUrl !== undefined) existing.externalUrl = params.externalUrl || null
    if (params.priceCents !== undefined) existing.priceCents = params.priceCents ?? null
    if (params.currency !== undefined) existing.currency = params.currency || 'EUR'
    if (params.category !== undefined) existing.category = params.category || null
    if (params.priority !== undefined) existing.priority = params.priority ?? 0
    if (params.isPoolable !== undefined) existing.isPoolable = params.isPoolable || false
    if (params.poolTargetCents !== undefined) existing.poolTargetCents = params.poolTargetCents ?? null

    const updated = await WishlistItemRepository.update(existing)
    return updated.toJSON()
  }

  static async deleteItem(itemId: number, clerkId: string): Promise<void> {
    const existing = await WishlistItemRepository.findById(itemId)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Wishlist item not found' })
    }

    await this.#verifyOrganizerAccess(existing.eventId, clerkId)
    await WishlistItemRepository.delete(itemId)
  }

  static async reorderItems(eventId: number, clerkId: string, orderedIds: number[]): Promise<void> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkWishlistFeature(event)
    await WishlistItemRepository.reorder(eventId, orderedIds)
  }

  static async bulkDeleteItems(eventId: number, clerkId: string, ids: number[]): Promise<void> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkWishlistFeature(event)
    await WishlistItemRepository.bulkDelete(ids)
  }

  static async getStats(eventId: number, clerkId: string): Promise<Record<string, unknown>> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkWishlistFeature(event)

    const stats = await WishlistItemRepository.getStatsForEvent(eventId)
    return stats
  }

  static async searchProducts(eventId: number, clerkId: string, query: string, category?: string): Promise<Record<string, unknown>[]> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkWishlistFeature(event)

    const provider = getProductSearchProvider()
    if (!query || query.trim().length < 2) {
      return provider.getPopular(category, 20)
    }
    return provider.search(query.trim(), { category, limit: 20 })
  }

  // --- Guest methods ---

  static async getGuestWishlist(accessToken: string): Promise<Record<string, unknown>> {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const event = await EventRepository.findById(invitation.eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const features = event.features as Record<string, boolean>
    if (!features?.wishlist) {
      return { items: [], myClaims: [] }
    }

    const rows = await WishlistItemRepository.findByEventIdWithClaims(invitation.eventId)
    const myClaims = await WishlistClaimRepository.findByEventAndGuest(invitation.eventId, invitation.inviteeEmail)

    const myClaimMap = new Map(myClaims.map((c) => [c.wishlistItemId, c]))

    // Batch-fetch message counts for all items
    const itemIds = rows.map(({ item }) => item.id!).filter(Boolean)
    const messageCounts = await WishlistItemMessageRepository.countByItemIds(itemIds)

    const items = rows.map(({ item, claimCount, pooledCents }) => {
      const myClaim = myClaimMap.get(item.id!)
      return {
        ...item.toJSON(),
        claimCount,
        pooledCents,
        messageCount: messageCounts[item.id!] || 0,
        isClaimed: !item.isPoolable && claimCount > 0,
        isFullyFunded: item.isPoolable && item.poolTargetCents ? pooledCents >= item.poolTargetCents : false,
        myClaim: myClaim ? {
          id: myClaim.id,
          amountCents: myClaim.amountCents,
          message: myClaim.message,
          status: myClaim.status,
        } : null,
      }
    })

    return { items }
  }

  static async claimItem(accessToken: string, itemId: number, data?: { message?: string, amountCents?: number }): Promise<Record<string, unknown>> {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const itemData = await WishlistItemRepository.findByIdWithClaims(itemId)
    if (!itemData) {
      throw createError({ statusCode: 404, statusMessage: 'Wishlist item not found' })
    }

    // Verify item belongs to the invited event
    if (itemData.item.eventId !== invitation.eventId) {
      throw createError({ statusCode: 403, statusMessage: 'This item does not belong to your event' })
    }

    // For non-poolable items, check not already claimed by someone else
    if (!itemData.item.isPoolable && itemData.claimCount > 0) {
      const existingClaim = itemData.claims.find((c) => c.guestEmail === invitation.inviteeEmail)
      if (!existingClaim) {
        throw createError({ statusCode: 409, statusMessage: 'This item has already been claimed' })
      }
    }

    // For poolable items with a target, check if already fully funded
    if (itemData.item.isPoolable && itemData.item.poolTargetCents) {
      if (itemData.pooledCents >= itemData.item.poolTargetCents) {
        throw createError({ statusCode: 409, statusMessage: 'This item is already fully funded' })
      }
    }

    const claim = await WishlistClaimRepository.upsert(itemId, invitation.inviteeEmail, {
      guestName: invitation.inviteeName || null,
      amountCents: data?.amountCents ?? null,
      message: data?.message || null,
      status: 'claimed',
    })

    ActivityLogController.log(invitation.eventId, 'claim', invitation.inviteeName || invitation.inviteeEmail, invitation.inviteeEmail, {
      itemTitle: itemData.item.title,
      amountCents: data?.amountCents,
    })

    return claim.toJSON()
  }

  static async unclaimItem(accessToken: string, itemId: number): Promise<void> {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const claim = await WishlistClaimRepository.findByItemAndGuest(itemId, invitation.inviteeEmail)
    if (!claim) {
      throw createError({ statusCode: 404, statusMessage: 'You have not claimed this item' })
    }
    if (claim.status === 'purchased') {
      throw createError({ statusCode: 400, statusMessage: 'Cannot unclaim an item marked as purchased' })
    }
    await WishlistClaimRepository.deleteByItemAndGuest(itemId, invitation.inviteeEmail)
  }

  static async markPurchased(accessToken: string, itemId: number): Promise<Record<string, unknown>> {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const claim = await WishlistClaimRepository.findByItemAndGuest(itemId, invitation.inviteeEmail)
    if (!claim) {
      throw createError({ statusCode: 404, statusMessage: 'You have not claimed this item' })
    }

    const item = await WishlistItemRepository.findById(itemId)
    const updated = await WishlistClaimRepository.upsert(itemId, invitation.inviteeEmail, {
      status: 'purchased',
    })

    ActivityLogController.log(invitation.eventId, 'purchase', invitation.inviteeName || invitation.inviteeEmail, invitation.inviteeEmail, {
      itemTitle: item?.title,
    })

    return updated.toJSON()
  }

  // --- Guest chat methods ---

  static async getItemChat(accessToken: string, itemId: number): Promise<Record<string, unknown>> {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const itemData = await WishlistItemRepository.findByIdWithClaims(itemId)
    if (!itemData) {
      throw createError({ statusCode: 404, statusMessage: 'Wishlist item not found' })
    }
    if (itemData.item.eventId !== invitation.eventId) {
      throw createError({ statusCode: 403, statusMessage: 'This item does not belong to your event' })
    }

    const messages = await WishlistItemMessageRepository.findByItemId(itemId)
    const contributors = itemData.claims.map((c) => ({
      guestName: c.guestName,
      amountCents: c.amountCents,
      isMe: c.guestEmail === invitation.inviteeEmail,
    }))

    return {
      messages: messages.map((m) => ({
        ...m.toJSON(),
        isMe: m.guestEmail === invitation.inviteeEmail,
        guestEmail: undefined,
      })),
      contributors,
    }
  }

  static async sendItemMessage(accessToken: string, itemId: number, content: string): Promise<Record<string, unknown>> {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const item = await WishlistItemRepository.findById(itemId)
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Wishlist item not found' })
    }
    if (item.eventId !== invitation.eventId) {
      throw createError({ statusCode: 403, statusMessage: 'This item does not belong to your event' })
    }

    const trimmed = (content || '').trim()
    if (!trimmed) {
      throw createError({ statusCode: 400, statusMessage: 'Message content is required' })
    }
    if (trimmed.length > 500) {
      throw createError({ statusCode: 400, statusMessage: 'Message must be 500 characters or less' })
    }

    const message = await WishlistItemMessageRepository.create(
      itemId,
      invitation.inviteeEmail,
      invitation.inviteeName || null,
      trimmed,
    )

    return {
      ...message.toJSON(),
      isMe: true,
      guestEmail: undefined,
    }
  }
}
