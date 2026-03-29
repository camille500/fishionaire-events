type TierName = 'free' | 'standard' | 'pro'

interface TierFeatureSet {
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
  emailNotifications: boolean
  advancedReminders: boolean
  digestEmails: boolean
  socialWall: boolean
  checkIn: boolean
  standaloneRsvp: boolean
}

export const TIER_FEATURES: Record<TierName, TierFeatureSet> = {
  free: {
    rsvp: false,
    datePolling: false,
    wishlist: false,
    secretChat: false,
    photoGallery: false,
    budgetTracker: false,
    seatingArrangements: false,
    timeline: false,
    customTheme: false,
    aiAssistant: false,
    analytics: false,
    emailNotifications: false,
    advancedReminders: false,
    digestEmails: false,
    socialWall: false,
    checkIn: false,
    standaloneRsvp: false,
  },
  standard: {
    rsvp: true,
    datePolling: true,
    wishlist: true,
    secretChat: true,
    photoGallery: true,
    budgetTracker: false,
    seatingArrangements: false,
    timeline: false,
    customTheme: false,
    aiAssistant: true,
    analytics: true,
    emailNotifications: true,
    advancedReminders: false,
    digestEmails: false,
    socialWall: true,
    checkIn: true,
    standaloneRsvp: true,
  },
  pro: {
    rsvp: true,
    datePolling: true,
    wishlist: true,
    secretChat: true,
    photoGallery: true,
    budgetTracker: true,
    seatingArrangements: true,
    timeline: true,
    customTheme: true,
    aiAssistant: true,
    analytics: true,
    emailNotifications: true,
    advancedReminders: true,
    digestEmails: true,
    socialWall: true,
    checkIn: true,
    standaloneRsvp: true,
  },
}

export const RSVP_PRICE_CENTS = 199

export const RSVP_GUEST_LIMITS: Record<TierName, number> = {
  free: 50,
  standard: 50,
  pro: 100,
}

export const AI_DAILY_TOKEN_LIMITS: Record<TierName, number> = {
  free: 10_000,
  standard: 100_000,
  pro: 500_000,
}

export const TIER_ORDER: Record<TierName, number> = { free: 0, standard: 1, pro: 2 }

export const EVENT_PRICES_CENTS: Record<string, number> = {
  standard: 1499,
  pro: 2999,
}

export function getFeaturesForTier(tier: TierName): TierFeatureSet {
  return { ...TIER_FEATURES[tier] }
}

export function isTierCoveredBySubscription(subscriptionTier: TierName, requestedTier: TierName): boolean {
  return TIER_ORDER[subscriptionTier] >= TIER_ORDER[requestedTier]
}
