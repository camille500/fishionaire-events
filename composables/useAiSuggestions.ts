export function useAiSuggestions() {
  const { locale } = useI18n()

  const titleSuggestions = ref([])
  const subEventSuggestions = ref([])
  const timelineItems = ref([])

  const loadingTitles = ref(false)
  const loadingSubEvents = ref(false)
  const loadingTimeline = ref(false)

  const error = ref('')

  async function suggestTitles({ eventType, context } = {}) {
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

  async function suggestSubEvents({ eventType, eventTitle, existingSubEvents } = {}) {
    loadingSubEvents.value = true
    error.value = ''
    subEventSuggestions.value = []

    try {
      const result = await $fetch('/api/ai/suggest-sub-events', {
        method: 'POST',
        body: {
          eventType,
          eventTitle,
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

  async function suggestTimeline({ eventType, eventDate, subEvents } = {}) {
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

  function dismissTitleSuggestion(index) {
    titleSuggestions.value.splice(index, 1)
  }

  function dismissSubEventSuggestion(index) {
    subEventSuggestions.value.splice(index, 1)
  }

  function clearAll() {
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
