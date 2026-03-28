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
  socialWall: boolean
  checkIn: boolean
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
  themeColorSecondary: string | null
  gradientAngle: number
  fontPairing: string | null
  cardStyle: string
  welcomeMessage: string | null
  heroAnimation: string
  backgroundPattern: string | null
  colorMode: string
  customLogoUrl: string | null
  customLogoKey: string | null
  hideBranding: boolean
  coverImageUrl: string | null
  coverImageKey: string | null
  ownerClerkId: string
  aiTone?: string | null
  aiToneCustom?: string | null
  aiExtraContext?: string | null
  rsvpEnabled: boolean
  rsvpDeadline: string | Date | null
  guestUploadsEnabled: boolean
  socialWallAutoApprove: boolean
  budgetTargetCents: number | null
  mode: string
  guestLimit: number | null
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
  themeColorSecondary?: string | null
  theme_color_secondary?: string | null
  gradientAngle?: number
  gradient_angle?: number
  fontPairing?: string | null
  font_pairing?: string | null
  cardStyle?: string
  card_style?: string
  welcomeMessage?: string | null
  welcome_message?: string | null
  heroAnimation?: string
  hero_animation?: string
  backgroundPattern?: string | null
  background_pattern?: string | null
  colorMode?: string
  color_mode?: string
  customLogoUrl?: string | null
  custom_logo_url?: string | null
  customLogoKey?: string | null
  custom_logo_key?: string | null
  hideBranding?: boolean
  hide_branding?: boolean
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
  socialWallAutoApprove?: boolean
  social_wall_auto_approve?: boolean
  budgetTargetCents?: number | null
  budget_target_cents?: number | null
  mode?: string
  guestLimit?: number | null
  guest_limit?: number | null
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
  themeColorSecondary: string | null
  gradientAngle: number
  fontPairing: string | null
  cardStyle: string
  welcomeMessage: string | null
  heroAnimation: string
  backgroundPattern: string | null
  colorMode: string
  customLogoUrl: string | null
  customLogoKey: string | null
  hideBranding: boolean
  coverImageUrl: string | null
  coverImageKey: string | null
  ownerClerkId: string
  aiTone: string | null
  aiToneCustom: string | null
  aiExtraContext: string | null
  rsvpEnabled: boolean
  rsvpDeadline: string | Date | null
  guestUploadsEnabled: boolean
  socialWallAutoApprove: boolean
  budgetTargetCents: number | null
  mode: string
  guestLimit: number | null
  budgetCurrency: string
  archivedAt: string | Date | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, title, description, eventType, eventDate, eventEndDate, location, locationLat, locationLon, isPrivate, shareToken, tier, features, themeColor, themeColorSecondary, gradientAngle, fontPairing, cardStyle, welcomeMessage, heroAnimation, backgroundPattern, colorMode, customLogoUrl, customLogoKey, hideBranding, coverImageUrl, coverImageKey, ownerClerkId, aiTone, aiToneCustom, aiExtraContext, rsvpEnabled, rsvpDeadline, guestUploadsEnabled, socialWallAutoApprove, budgetTargetCents, budgetCurrency, mode, guestLimit, archivedAt, createdAt, updatedAt }: EventData) {
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
    this.themeColorSecondary = themeColorSecondary || null
    this.gradientAngle = gradientAngle ?? 135
    this.fontPairing = fontPairing || null
    this.cardStyle = cardStyle || 'glass'
    this.welcomeMessage = welcomeMessage || null
    this.heroAnimation = heroAnimation || 'fadeUp'
    this.backgroundPattern = backgroundPattern || null
    this.colorMode = colorMode || 'auto'
    this.customLogoUrl = customLogoUrl || null
    this.customLogoKey = customLogoKey || null
    this.hideBranding = hideBranding ?? false
    this.coverImageUrl = coverImageUrl || null
    this.coverImageKey = coverImageKey || null
    this.ownerClerkId = ownerClerkId
    this.aiTone = aiTone || null
    this.aiToneCustom = aiToneCustom || null
    this.aiExtraContext = aiExtraContext || null
    this.rsvpEnabled = rsvpEnabled ?? true
    this.rsvpDeadline = rsvpDeadline || null
    this.guestUploadsEnabled = guestUploadsEnabled ?? true
    this.socialWallAutoApprove = socialWallAutoApprove ?? false
    this.budgetTargetCents = budgetTargetCents ?? null
    this.mode = mode || 'event'
    this.guestLimit = guestLimit ?? null
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
      themeColorSecondary: data.themeColorSecondary || data.theme_color_secondary || null,
      gradientAngle: data.gradientAngle ?? data.gradient_angle ?? 135,
      fontPairing: data.fontPairing || data.font_pairing || null,
      cardStyle: data.cardStyle || data.card_style || 'glass',
      welcomeMessage: data.welcomeMessage ?? data.welcome_message ?? null,
      heroAnimation: data.heroAnimation || data.hero_animation || 'fadeUp',
      backgroundPattern: data.backgroundPattern || data.background_pattern || null,
      colorMode: data.colorMode || data.color_mode || 'auto',
      customLogoUrl: data.customLogoUrl || data.custom_logo_url || null,
      customLogoKey: data.customLogoKey || data.custom_logo_key || null,
      hideBranding: data.hideBranding ?? data.hide_branding ?? false,
      coverImageUrl: data.coverImageUrl || data.cover_image_url || null,
      coverImageKey: data.coverImageKey || data.cover_image_key || null,
      ownerClerkId: (data.ownerClerkId || data.owner_clerk_id)!,
      aiTone: data.aiTone ?? data.ai_tone ?? null,
      aiToneCustom: data.aiToneCustom ?? data.ai_tone_custom ?? null,
      aiExtraContext: data.aiExtraContext ?? data.ai_extra_context ?? null,
      rsvpEnabled: data.rsvpEnabled ?? data.rsvp_enabled ?? true,
      rsvpDeadline: data.rsvpDeadline || data.rsvp_deadline || null,
      guestUploadsEnabled: data.guestUploadsEnabled ?? data.guest_uploads_enabled ?? true,
      socialWallAutoApprove: data.socialWallAutoApprove ?? data.social_wall_auto_approve ?? false,
      budgetTargetCents: data.budgetTargetCents ?? data.budget_target_cents ?? null,
      mode: data.mode || 'event',
      guestLimit: data.guestLimit ?? data.guest_limit ?? null,
      budgetCurrency: data.budgetCurrency || data.budget_currency || 'EUR',
      archivedAt: data.archivedAt || data.archived_at || null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toSummaryJSON(): Partial<EventData> {
    return {
      id: this.id,
      title: this.title,
      eventType: this.eventType,
      eventDate: this.eventDate,
      eventEndDate: this.eventEndDate,
      location: this.location,
      coverImageUrl: this.coverImageUrl,
      tier: this.tier,
      mode: this.mode,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
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
      themeColorSecondary: this.themeColorSecondary,
      gradientAngle: this.gradientAngle,
      fontPairing: this.fontPairing,
      cardStyle: this.cardStyle,
      welcomeMessage: this.welcomeMessage,
      heroAnimation: this.heroAnimation,
      backgroundPattern: this.backgroundPattern,
      colorMode: this.colorMode,
      customLogoUrl: this.customLogoUrl,
      customLogoKey: this.customLogoKey,
      hideBranding: this.hideBranding,
      coverImageUrl: this.coverImageUrl,
      coverImageKey: this.coverImageKey,
      ownerClerkId: this.ownerClerkId,
      aiTone: this.aiTone,
      aiToneCustom: this.aiToneCustom,
      aiExtraContext: this.aiExtraContext,
      rsvpEnabled: this.rsvpEnabled,
      rsvpDeadline: this.rsvpDeadline,
      guestUploadsEnabled: this.guestUploadsEnabled,
      socialWallAutoApprove: this.socialWallAutoApprove,
      budgetTargetCents: this.budgetTargetCents,
      mode: this.mode,
      guestLimit: this.guestLimit,
      budgetCurrency: this.budgetCurrency,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
