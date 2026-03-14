export function useWizardAi() {
  const { locale } = useI18n()
  const { tier, isFree, isStandard, isPro } = useSubscription()

  const ai = useAiSuggestions()

  // Track AI usage during wizard session (for tier upsell)
  const aiUsageCount = ref(0)
  const aiFeatureUsed = ref(false)

  // AI Quick Start state
  const buildPrompt = ref('')
  const buildLoading = ref(false)
  const buildError = ref('')
  const buildResult = ref(null)

  // Free tier: limited to 2 title suggestions
  const FREE_TITLE_LIMIT = 2

  // Tier-aware title suggestions
  async function suggestTitles({ eventType, context } = {}) {
    aiFeatureUsed.value = true
    aiUsageCount.value++

    await ai.suggestTitles({ eventType, context })

    // Free tier: limit to 2 suggestions
    if (isFree.value && ai.titleSuggestions.value.length > FREE_TITLE_LIMIT) {
      ai.titleSuggestions.value = ai.titleSuggestions.value.slice(0, FREE_TITLE_LIMIT)
    }
  }

  // Tier-aware sub-event suggestions (Standard+)
  async function suggestSubEvents({ eventType, eventTitle, existingSubEvents } = {}) {
    if (isFree.value) return // Free tier: no AI sub-event suggestions

    aiFeatureUsed.value = true
    aiUsageCount.value++
    await ai.suggestSubEvents({ eventType, eventTitle, existingSubEvents })
  }

  // Tier-aware timeline suggestions (Pro only)
  async function suggestTimeline({ eventType, eventDate, subEvents } = {}) {
    if (!isPro.value) return // Pro only

    aiFeatureUsed.value = true
    aiUsageCount.value++
    await ai.suggestTimeline({ eventType, eventDate, subEvents })
  }

  // AI Quick Start: build entire event from description (Standard+)
  async function buildEvent(description) {
    if (isFree.value) return null

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
      return result
    } catch (e) {
      buildError.value = e.data?.statusMessage || 'AI build failed'
      return null
    } finally {
      buildLoading.value = false
    }
  }

  // Generate description (Standard+)
  async function generateDescription({ eventType, title } = {}) {
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
  const canUseBuildEvent = computed(() => isStandard.value || isPro.value)
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

  function resetAiState() {
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

    // Upsell
    aiFeatureUsed,
    aiUsageCount,
    showAiUpsell,
    upsellMessage,

    // Reset
    resetAiState,
  }
}
