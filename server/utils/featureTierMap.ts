import { TIER_FEATURES } from './tierFeatures'

type TierName = 'free' | 'standard' | 'pro'

const TIER_ORDER: TierName[] = ['free', 'standard', 'pro']

/**
 * Reverse mapping: feature key → minimum tier that enables it.
 * Derived from TIER_FEATURES so it stays in sync automatically.
 */
export const FEATURE_TIER_MAP: Record<string, TierName> = (() => {
  const map: Record<string, TierName> = {}
  for (const tier of TIER_ORDER) {
    const features = TIER_FEATURES[tier]
    for (const [key, enabled] of Object.entries(features)) {
      if (enabled && !map[key]) {
        map[key] = tier
      }
    }
  }
  return map
})()

export function getFeatureTierMap(): Record<string, TierName> {
  return { ...FEATURE_TIER_MAP }
}
