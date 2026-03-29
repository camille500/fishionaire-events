import AiTokenUsageRepository from '../repositories/aiTokenUsageRepository'
import SubscriptionRepository from '../repositories/subscriptionRepository'
import { AI_DAILY_TOKEN_LIMITS } from '../utils/tierFeatures'

type TierName = 'free' | 'standard' | 'pro'

function getToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export default class AiTokenUsageController {
  static async checkLimit(clerkId: string): Promise<{ allowed: true, tokensUsed: number, limit: number }> {
    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)
    const tier = (subscription?.tier as TierName) || 'free'
    const limit = AI_DAILY_TOKEN_LIMITS[tier] ?? AI_DAILY_TOKEN_LIMITS.free

    const today = getToday()
    const usage = await AiTokenUsageRepository.findByUserAndDate(clerkId, today)
    const tokensUsed = usage?.tokensUsed ?? 0

    if (tokensUsed >= limit) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Daily AI token limit reached. Resets at midnight.',
        data: { code: 'AI_TOKEN_LIMIT', tokensUsed, limit, tier },
      })
    }

    return { allowed: true, tokensUsed, limit }
  }

  static async recordTokens(clerkId: string, tokens: number): Promise<void> {
    if (tokens > 0) {
      await AiTokenUsageRepository.recordUsage(clerkId, tokens)
    }
  }

  static async getUsage(clerkId: string): Promise<{
    tokensUsed: number
    limit: number
    remaining: number
    percentage: number
    tier: string
  }> {
    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)
    const tier = (subscription?.tier as TierName) || 'free'
    const limit = AI_DAILY_TOKEN_LIMITS[tier] ?? AI_DAILY_TOKEN_LIMITS.free

    const today = getToday()
    const usage = await AiTokenUsageRepository.findByUserAndDate(clerkId, today)
    const tokensUsed = usage?.tokensUsed ?? 0
    const remaining = Math.max(0, limit - tokensUsed)
    const percentage = Math.round((tokensUsed / limit) * 1000) / 10

    return { tokensUsed, limit, remaining, percentage, tier }
  }
}
