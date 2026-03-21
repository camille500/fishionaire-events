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

  // Chat-based AI builder state
  interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    isResult?: boolean
  }
  const chatMessages = ref<ChatMessage[]>([])
  const chatLoading = ref<boolean>(false)
  const chatError = ref<string>('')
  const chatComplete = ref<boolean>(false)
  const chatUserTurns = ref<number>(0)

  // Turn limits (user messages only)
  const FREE_CHAT_LIMIT = 3
  const STANDARD_CHAT_LIMIT = 8
  const PRO_CHAT_LIMIT = 15

  const chatTurnLimit = computed(() => {
    if (isPro.value) return PRO_CHAT_LIMIT
    if (isStandard.value) return STANDARD_CHAT_LIMIT
    return FREE_CHAT_LIMIT
  })

  const chatTurnsRemaining = computed(() => Math.max(0, chatTurnLimit.value - chatUserTurns.value))
  const chatLimitReached = computed(() => chatUserTurns.value >= chatTurnLimit.value)

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

  // Chat-based AI event builder
  async function sendChatMessage(userMessage: string): Promise<{ type: string, message: string } | null> {
    if (chatComplete.value) return null
    if (isFree.value && freeBuildUsed.value) return null

    chatMessages.value.push({ role: 'user', content: userMessage })
    chatUserTurns.value++
    chatLoading.value = true
    chatError.value = ''

    // Build messages to send (only role + content)
    const messagesToSend = chatMessages.value
      .filter((m) => !m.isResult)
      .map(({ role, content }) => ({ role, content }))

    // If turn limit reached, force generation
    if (chatLimitReached.value) {
      messagesToSend.push({
        role: 'user',
        content: 'Please generate the event now with the information you have.',
      })
    }

    try {
      const response = await $fetch('/api/ai/chat-build-event', {
        method: 'POST',
        body: {
          messages: messagesToSend,
          language: locale.value,
        },
      })

      if (response.type === 'result') {
        chatMessages.value.push({ role: 'assistant', content: response.message, isResult: true })
        buildResult.value = response.event
        chatComplete.value = true
      } else {
        chatMessages.value.push({ role: 'assistant', content: response.message })
      }

      aiFeatureUsed.value = true
      aiUsageCount.value++
      if (isFree.value) freeBuildUsed.value = true

      return response
    } catch (e: any) {
      chatError.value = e.data?.statusMessage || 'AI chat failed'
      // Remove the user message we added since the call failed
      chatMessages.value.pop()
      chatUserTurns.value--
      return null
    } finally {
      chatLoading.value = false
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

  function continueChat(): void {
    chatComplete.value = false
    // Remove the result message so the user can continue
    const lastMsg = chatMessages.value[chatMessages.value.length - 1]
    if (lastMsg?.isResult) {
      chatMessages.value.pop()
    }
  }

  function undoLastTurn(): void {
    if (chatComplete.value) return
    // Remove last assistant + user message pair
    if (chatMessages.value.length >= 2) {
      const last = chatMessages.value[chatMessages.value.length - 1]
      if (last.role === 'assistant') {
        chatMessages.value.pop() // remove assistant
        chatMessages.value.pop() // remove user
        chatUserTurns.value = Math.max(0, chatUserTurns.value - 1)
      }
    }
  }

  function resetAiState(): void {
    ai.clearAll()
    buildPrompt.value = ''
    buildLoading.value = false
    buildError.value = ''
    buildResult.value = null
    aiUsageCount.value = 0
    aiFeatureUsed.value = false
    chatMessages.value = []
    chatLoading.value = false
    chatError.value = ''
    chatComplete.value = false
    chatUserTurns.value = 0
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

    // AI Quick Start (legacy one-shot)
    buildPrompt,
    buildLoading,
    buildError,
    buildResult,
    buildEvent,

    // Chat-based AI builder
    chatMessages,
    chatLoading,
    chatError,
    chatComplete,
    chatUserTurns,
    chatTurnLimit,
    chatTurnsRemaining,
    chatLimitReached,
    sendChatMessage,
    continueChat,
    undoLastTurn,

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
