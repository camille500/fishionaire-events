interface AiUsageData {
  tokensUsed: number
  limit: number
  remaining: number
  percentage: number
  tier: string
}

export function useAiTokenUsage() {
  const { data, refresh, status } = useFetch<AiUsageData>('/api/ai/usage', {
    key: 'ai-token-usage',
  })

  const percentage = computed(() => data.value?.percentage ?? 0)
  const isNearLimit = computed(() => percentage.value >= 80)
  const isAtLimit = computed(() => percentage.value >= 100)

  return { usage: data, percentage, isNearLimit, isAtLimit, refresh, status }
}
