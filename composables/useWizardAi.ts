export function useWizardAi(eventId?: Ref<string | undefined>) {
  const { locale } = useI18n()
  const { tier, isFree, isStandard, isPro } = useSubscription()

  const ai = useAiSuggestions()

  // Track AI usage during wizard session (for tier upsell)
  const aiUsageCount = ref<number>(0)
  const aiFeatureUsed = ref<boolean>(false)

  // AI Quick Start state
  const buildPrompt = ref<string>('')
  const buildLoading = ref<boolean>(false)
  const buildError = ref<string>('')
  const buildResult = ref<Record<string, unknown> | null>(null)

  // Free tier: limited to 2 title suggestions
  const FREE_TITLE_LIMIT = 2

  // Tier-aware title suggestions
  async function suggestTitles({ eventType, context }: { eventType?: string, context?: string } = {}): Promise<void> {
    aiFeatureUsed.value = true
    aiUsageCount.value++

    await ai.suggestTitles({ eventType, context, eventId: eventId?.value })

    // Free tier: limit to 2 suggestions
    if (isFree.value && ai.titleSuggestions.value.length > FREE_TITLE_LIMIT) {
      ai.titleSuggestions.value = ai.titleSuggestions.value.slice(0, FREE_TITLE_LIMIT)
    }
  }

  // Tier-aware sub-event suggestions (Standard+)
  async function suggestSubEvents({ eventType, eventTitle, existingSubEvents }: { eventType?: string, eventTitle?: string, existingSubEvents?: unknown[] } = {}): Promise<void> {
    if (isFree.value) return // Free tier: no AI sub-event suggestions

    aiFeatureUsed.value = true
    aiUsageCount.value++
    await ai.suggestSubEvents({ eventType, eventTitle, existingSubEvents, eventId: eventId?.value })
  }

  // Tier-aware timeline suggestions (Pro only)
  async function suggestTimeline({ eventType, eventDate, subEvents }: { eventType?: string, eventDate?: string, subEvents?: unknown[] } = {}): Promise<void> {
    if (!isPro.value) return // Pro only

    aiFeatureUsed.value = true
    aiUsageCount.value++
    await ai.suggestTimeline({ eventType, eventDate, subEvents, eventId: eventId?.value })
  }

  // AI Quick Start: build entire event from description (all tiers)
  // Free tier gets limited AI build for event creation only
  const freeBuildUsed = useLocalStorage('fishionaire-ai-build-used', false)

  async function buildEvent(description: string): Promise<Record<string, unknown> | null> {
    // Free tier: allow 1 AI build per session
    if (isFree.value && freeBuildUsed.value) return null

    buildLoading.value = true
    buildError.value = ''
    buildResult.value = null

    try {
      const result = await $fetch('/api/ai/build-event', {
        method: 'POST',
        body: {
          description,
          language: locale.value,
        },
      })

      buildResult.value = result
      aiFeatureUsed.value = true
      aiUsageCount.value++
      if (isFree.value) freeBuildUsed.value = true
      return result
    } catch (e) {
      buildError.value = e.data?.statusMessage || 'AI build failed'
      return null
    } finally {
      buildLoading.value = false
    }
  }

  // Generate description (Standard+)
  async function generateDescription({ eventType, title }: { eventType?: string, title?: string } = {}): Promise<string | null> {
    if (isFree.value) return null

    aiFeatureUsed.value = true
    aiUsageCount.value++

    try {
      const result = await $fetch('/api/ai/generate-description', {
        method: 'POST',
        body: {
          eventType,
          title,
          language: locale.value,
        },
      })
      return result.description || ''
    } catch {
      return null
    }
  }

  // Feature access checks
  const canUseTitleSuggestions = computed(() => true) // all tiers
  const canUseSubEventSuggestions = computed(() => isStandard.value || isPro.value)
  const canUseTimeline = computed(() => isPro.value)
  const canUseBuildEvent = computed(() => {
    // All tiers can use AI build, but free tier is limited to 1 use
    if (isFree.value) return !freeBuildUsed.value
    return true
  })
  const freeBuildExhausted = computed(() => isFree.value && freeBuildUsed.value)
  const canUseDescriptionGen = computed(() => isStandard.value || isPro.value)
  const canUseAutoDescription = computed(() => isPro.value) // auto-gen on type for Pro

  // Upsell context
  const showAiUpsell = computed(() => {
    return isFree.value && aiFeatureUsed.value
  })

  const upsellMessage = computed(() => {
    if (!showAiUpsell.value) return ''
    return 'wizard.aiUpsellMessage'
  })

  function resetAiState(): void {
    ai.clearAll()
    buildPrompt.value = ''
    buildLoading.value = false
    buildError.value = ''
    buildResult.value = null
    aiUsageCount.value = 0
    aiFeatureUsed.value = false
  }

  return {
    // Tier info
    tier,
    isFree,
    isStandard,
    isPro,

    // Existing AI state (pass-through)
    titleSuggestions: ai.titleSuggestions,
    subEventSuggestions: ai.subEventSuggestions,
    timelineItems: ai.timelineItems,
    loadingTitles: ai.loadingTitles,
    loadingSubEvents: ai.loadingSubEvents,
    loadingTimeline: ai.loadingTimeline,
    aiError: ai.error,

    // Dismiss helpers
    dismissTitleSuggestion: ai.dismissTitleSuggestion,
    dismissSubEventSuggestion: ai.dismissSubEventSuggestion,

    // Tier-aware methods
    suggestTitles,
    suggestSubEvents,
    suggestTimeline,
    generateDescription,

    // AI Quick Start
    buildPrompt,
    buildLoading,
    buildError,
    buildResult,
    buildEvent,

    // Feature access
    canUseTitleSuggestions,
    canUseSubEventSuggestions,
    canUseTimeline,
    canUseBuildEvent,
    canUseDescriptionGen,
    canUseAutoDescription,
    freeBuildExhausted,

    // Upsell
    aiFeatureUsed,
    aiUsageCount,
    showAiUpsell,
    upsellMessage,

    // Reset
    resetAiState,
  }
}
