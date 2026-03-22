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
  },
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
