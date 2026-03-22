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
  locationLat: number | null
  locationLon: number | null
  isPrivate: boolean
  shareToken: string | null
  tier: string
  features: EventFeatures
  themeColor: string | null
  coverImageUrl: string | null
  coverImageKey: string | null
  ownerClerkId: string
  aiTone?: string | null
  aiToneCustom?: string | null
  aiExtraContext?: string | null
  rsvpEnabled: boolean
  rsvpDeadline: string | Date | null
  guestUploadsEnabled: boolean
  budgetTargetCents: number | null
  budgetCurrency: string
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
  locationLat?: number | null
  location_lat?: number | null
  locationLon?: number | null
  location_lon?: number | null
  isPrivate?: boolean
  is_private?: boolean
  shareToken?: string | null
  share_token?: string | null
  tier?: string
  features?: Partial<EventFeatures>
  themeColor?: string | null
  theme_color?: string | null
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
  rsvpEnabled?: boolean
  rsvp_enabled?: boolean
  rsvpDeadline?: string | Date | null
  rsvp_deadline?: string | Date | null
  guestUploadsEnabled?: boolean
  guest_uploads_enabled?: boolean
  budgetTargetCents?: number | null
  budget_target_cents?: number | null
  budgetCurrency?: string
  budget_currency?: string
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
  locationLat: number | null
  locationLon: number | null
  isPrivate: boolean
  shareToken: string | null
  tier: string
  features: EventFeatures
  themeColor: string | null
  coverImageUrl: string | null
  coverImageKey: string | null
  ownerClerkId: string
  aiTone: string | null
  aiToneCustom: string | null
  aiExtraContext: string | null
  rsvpEnabled: boolean
  rsvpDeadline: string | Date | null
  guestUploadsEnabled: boolean
  budgetTargetCents: number | null
  budgetCurrency: string
  archivedAt: string | Date | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, title, description, eventType, eventDate, eventEndDate, location, locationLat, locationLon, isPrivate, shareToken, tier, features, themeColor, coverImageUrl, coverImageKey, ownerClerkId, aiTone, aiToneCustom, aiExtraContext, rsvpEnabled, rsvpDeadline, guestUploadsEnabled, budgetTargetCents, budgetCurrency, archivedAt, createdAt, updatedAt }: EventData) {
    this.id = id || null
    this.title = title
    this.description = description || null
    this.eventType = eventType || null
    this.eventDate = eventDate || null
    this.eventEndDate = eventEndDate || null
    this.location = location || null
    this.locationLat = locationLat ?? null
    this.locationLon = locationLon ?? null
    this.isPrivate = isPrivate ?? true
    this.shareToken = shareToken || null
    this.tier = tier || 'free'
    this.features = { ...getFeaturesForTier(this.tier), ...(features || {}) }
    this.themeColor = themeColor || null
    this.coverImageUrl = coverImageUrl || null
    this.coverImageKey = coverImageKey || null
    this.ownerClerkId = ownerClerkId
    this.aiTone = aiTone || null
    this.aiToneCustom = aiToneCustom || null
    this.aiExtraContext = aiExtraContext || null
    this.rsvpEnabled = rsvpEnabled ?? true
    this.rsvpDeadline = rsvpDeadline || null
    this.guestUploadsEnabled = guestUploadsEnabled ?? true
    this.budgetTargetCents = budgetTargetCents ?? null
    this.budgetCurrency = budgetCurrency || 'EUR'
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
      locationLat: data.locationLat ?? data.location_lat ?? null,
      locationLon: data.locationLon ?? data.location_lon ?? null,
      isPrivate: data.isPrivate ?? data.is_private ?? true,
      shareToken: data.shareToken || data.share_token || null,
      tier: data.tier || 'free',
      features: (data.features || {}) as EventFeatures,
      themeColor: data.themeColor || data.theme_color || null,
      coverImageUrl: data.coverImageUrl || data.cover_image_url || null,
      coverImageKey: data.coverImageKey || data.cover_image_key || null,
      ownerClerkId: (data.ownerClerkId || data.owner_clerk_id)!,
      aiTone: data.aiTone ?? data.ai_tone ?? null,
      aiToneCustom: data.aiToneCustom ?? data.ai_tone_custom ?? null,
      aiExtraContext: data.aiExtraContext ?? data.ai_extra_context ?? null,
      rsvpEnabled: data.rsvpEnabled ?? data.rsvp_enabled ?? true,
      rsvpDeadline: data.rsvpDeadline || data.rsvp_deadline || null,
      guestUploadsEnabled: data.guestUploadsEnabled ?? data.guest_uploads_enabled ?? true,
      budgetTargetCents: data.budgetTargetCents ?? data.budget_target_cents ?? null,
      budgetCurrency: data.budgetCurrency || data.budget_currency || 'EUR',
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
      locationLat: this.locationLat,
      locationLon: this.locationLon,
      isPrivate: this.isPrivate,
      shareToken: this.shareToken,
      tier: this.tier,
      features: this.features,
      themeColor: this.themeColor,
      coverImageUrl: this.coverImageUrl,
      coverImageKey: this.coverImageKey,
      ownerClerkId: this.ownerClerkId,
      aiTone: this.aiTone,
      aiToneCustom: this.aiToneCustom,
      aiExtraContext: this.aiExtraContext,
      rsvpEnabled: this.rsvpEnabled,
      rsvpDeadline: this.rsvpDeadline,
      guestUploadsEnabled: this.guestUploadsEnabled,
      budgetTargetCents: this.budgetTargetCents,
      budgetCurrency: this.budgetCurrency,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
