export const TIER_FEATURES = {
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
  },
}

export const TIER_ORDER = { free: 0, standard: 1, pro: 2 }

export const EVENT_PRICES_CENTS = {
  standard: 1499,
  pro: 2999,
}

export function getFeaturesForTier(tier) {
  return { ...TIER_FEATURES[tier] }
}

export function isTierCoveredBySubscription(subscriptionTier, requestedTier) {
  return TIER_ORDER[subscriptionTier] >= TIER_ORDER[requestedTier]
}
