import { getFeaturesForTier } from '../utils/tierFeatures'

export interface EventFeatures {
  rsvp: boolean
  datePolling: boolean
  wishlist: boolean
  secretChat: boolean
  photoGallery: boolean
  budgetTracker: boolean
  seatingArrangements: boolean
  timeline: boolean
  customTheme: boolean
  aiAssistant: boolean
  analytics: boolean
}

export interface EventData {
  id: string | null
  title: string
  description: string | null
  eventType: string | null
  eventDate: string | Date | null
  eventEndDate: string | Date | null
  location: string | null
  isPrivate: boolean
  shareToken: string | null
  tier: string
  features: EventFeatures
  coverImageUrl: string | null
  coverImageKey: string | null
  ownerClerkId: string
  aiTone?: string | null
  aiToneCustom?: string | null
  aiExtraContext?: string | null
  archivedAt: string | Date | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface EventJSON {
  id?: string | null
  title: string
  description?: string | null
  eventType?: string | null
  event_type?: string | null
  eventDate?: string | Date | null
  event_date?: string | Date | null
  eventEndDate?: string | Date | null
  event_end_date?: string | Date | null
  location?: string | null
  isPrivate?: boolean
  is_private?: boolean
  shareToken?: string | null
  share_token?: string | null
  tier?: string
  features?: Partial<EventFeatures>
  coverImageUrl?: string | null
  cover_image_url?: string | null
  coverImageKey?: string | null
  cover_image_key?: string | null
  ownerClerkId?: string
  owner_clerk_id?: string
  aiTone?: string | null
  ai_tone?: string | null
  aiToneCustom?: string | null
  ai_tone_custom?: string | null
  aiExtraContext?: string | null
  ai_extra_context?: string | null
  archivedAt?: string | Date | null
  archived_at?: string | Date | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class Event {
  id: string | null
  title: string
  description: string | null
  eventType: string | null
  eventDate: string | Date | null
  eventEndDate: string | Date | null
  location: string | null
  isPrivate: boolean
  shareToken: string | null
  tier: string
  features: EventFeatures
  coverImageUrl: string | null
  coverImageKey: string | null
  ownerClerkId: string
  aiTone: string | null
  aiToneCustom: string | null
  aiExtraContext: string | null
  archivedAt: string | Date | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, title, description, eventType, eventDate, eventEndDate, location, isPrivate, shareToken, tier, features, coverImageUrl, coverImageKey, ownerClerkId, aiTone, aiToneCustom, aiExtraContext, archivedAt, createdAt, updatedAt }: EventData) {
    this.id = id || null
    this.title = title
    this.description = description || null
    this.eventType = eventType || null
    this.eventDate = eventDate || null
    this.eventEndDate = eventEndDate || null
    this.location = location || null
    this.isPrivate = isPrivate ?? true
    this.shareToken = shareToken || null
    this.tier = tier || 'free'
    this.features = { ...getFeaturesForTier(this.tier), ...(features || {}) }
    this.coverImageUrl = coverImageUrl || null
    this.coverImageKey = coverImageKey || null
    this.ownerClerkId = ownerClerkId
    this.aiTone = aiTone || null
    this.aiToneCustom = aiToneCustom || null
    this.aiExtraContext = aiExtraContext || null
    this.archivedAt = archivedAt || null
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data: EventJSON): Event {
    return new Event({
      id: data.id ?? null,
      title: data.title,
      description: data.description ?? null,
      eventType: data.eventType || data.event_type || null,
      eventDate: data.eventDate || data.event_date || null,
      eventEndDate: data.eventEndDate || data.event_end_date || null,
      location: data.location ?? null,
      isPrivate: data.isPrivate ?? data.is_private ?? true,
      shareToken: data.shareToken || data.share_token || null,
      tier: data.tier || 'free',
      features: (data.features || {}) as EventFeatures,
      coverImageUrl: data.coverImageUrl || data.cover_image_url || null,
      coverImageKey: data.coverImageKey || data.cover_image_key || null,
      ownerClerkId: (data.ownerClerkId || data.owner_clerk_id)!,
      aiTone: data.aiTone ?? data.ai_tone ?? null,
      aiToneCustom: data.aiToneCustom ?? data.ai_tone_custom ?? null,
      aiExtraContext: data.aiExtraContext ?? data.ai_extra_context ?? null,
      archivedAt: data.archivedAt || data.archived_at || null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): EventData {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      eventType: this.eventType,
      eventDate: this.eventDate,
      eventEndDate: this.eventEndDate,
      location: this.location,
      isPrivate: this.isPrivate,
      shareToken: this.shareToken,
      tier: this.tier,
      features: this.features,
      coverImageUrl: this.coverImageUrl,
      coverImageKey: this.coverImageKey,
      ownerClerkId: this.ownerClerkId,
      aiTone: this.aiTone,
      aiToneCustom: this.aiToneCustom,
      aiExtraContext: this.aiExtraContext,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
