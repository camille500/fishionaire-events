interface TitleSuggestParams {
  eventType?: string
  context?: string
}

interface SubEventSuggestParams {
  eventType?: string
  eventTitle?: string
  description?: string
  eventDate?: string
  existingSubEvents?: unknown[]
}

interface TimelineSuggestParams {
  eventType?: string
  eventDate?: string
  subEvents?: unknown[]
}

export function useAiSuggestions() {
  const { locale } = useI18n()

  const titleSuggestions = ref<string[]>([])
  const subEventSuggestions = ref<string[]>([])
  const timelineItems = ref<unknown[]>([])

  const loadingTitles = ref<boolean>(false)
  const loadingSubEvents = ref<boolean>(false)
  const loadingTimeline = ref<boolean>(false)

  const error = ref<string>('')

  async function suggestTitles({ eventType, context }: TitleSuggestParams = {}): Promise<void> {
    loadingTitles.value = true
    error.value = ''
    titleSuggestions.value = []

    try {
      const result = await $fetch('/api/ai/suggest-title', {
        method: 'POST',
        body: {
          eventType,
          context,
          language: locale.value,
        },
      })
      titleSuggestions.value = result.suggestions || []
    } catch (e) {
      error.value = e.data?.statusMessage || 'AI suggestion failed'
    } finally {
      loadingTitles.value = false
    }
  }

  async function suggestSubEvents({ eventType, eventTitle, description, eventDate, existingSubEvents }: SubEventSuggestParams = {}): Promise<void> {
    loadingSubEvents.value = true
    error.value = ''
    subEventSuggestions.value = []

    try {
      const result = await $fetch('/api/ai/suggest-sub-events', {
        method: 'POST',
        body: {
          eventType,
          eventTitle,
          description,
          eventDate,
          existingSubEvents,
          language: locale.value,
        },
      })
      subEventSuggestions.value = result.suggestions || []
    } catch (e) {
      error.value = e.data?.statusMessage || 'AI suggestion failed'
    } finally {
      loadingSubEvents.value = false
    }
  }

  async function suggestTimeline({ eventType, eventDate, subEvents }: TimelineSuggestParams = {}): Promise<void> {
    loadingTimeline.value = true
    error.value = ''
    timelineItems.value = []

    try {
      const result = await $fetch('/api/ai/suggest-timeline', {
        method: 'POST',
        body: {
          eventType,
          eventDate,
          subEvents,
          language: locale.value,
        },
      })
      timelineItems.value = result.items || []
    } catch (e) {
      error.value = e.data?.statusMessage || 'AI suggestion failed'
    } finally {
      loadingTimeline.value = false
    }
  }

  function dismissTitleSuggestion(index: number): void {
    titleSuggestions.value.splice(index, 1)
  }

  function dismissSubEventSuggestion(index: number): void {
    subEventSuggestions.value.splice(index, 1)
  }

  function clearAll(): void {
    titleSuggestions.value = []
    subEventSuggestions.value = []
    timelineItems.value = []
    error.value = ''
  }

  return {
    titleSuggestions,
    subEventSuggestions,
    timelineItems,
    loadingTitles,
    loadingSubEvents,
    loadingTimeline,
    error,
    suggestTitles,
    suggestSubEvents,
    suggestTimeline,
    dismissTitleSuggestion,
    dismissSubEventSuggestion,
    clearAll,
  }
}
