interface CoCreateSuggestion {
  title: string
  type: string
  description: string
  durationMinutes: number
  location?: string
  typeConfig?: Record<string, unknown>
  accepted?: boolean
  editing?: boolean
}

export function useAiCoCreate() {
  const { locale } = useI18n()

  const prompt = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const suggestions = ref<CoCreateSuggestion[]>([])
  const hasGenerated = ref(false)

  async function generate(params: {
    eventType?: string
    eventTitle?: string
    existingSubEvents?: Array<{ title: string }>
    eventId?: string
  }) {
    if (!prompt.value.trim()) return

    loading.value = true
    error.value = null

    try {
      const result = await $fetch('/api/ai/co-create-sub-events', {
        method: 'POST',
        body: {
          eventType: params.eventType,
          eventTitle: params.eventTitle,
          userPrompt: prompt.value,
          existingSubEvents: params.existingSubEvents || [],
          language: locale.value,
          eventId: params.eventId,
        },
      })

      suggestions.value = (result.suggestions || []).map((s: CoCreateSuggestion) => ({
        ...s,
        accepted: false,
        editing: false,
      }))
      hasGenerated.value = true
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Failed to generate suggestions'
    } finally {
      loading.value = false
    }
  }

  function acceptSuggestion(index: number) {
    if (suggestions.value[index]) {
      suggestions.value[index].accepted = true
    }
  }

  function dismissSuggestion(index: number) {
    suggestions.value.splice(index, 1)
  }

  function updateSuggestion(index: number, updates: Partial<CoCreateSuggestion>) {
    if (suggestions.value[index]) {
      suggestions.value[index] = { ...suggestions.value[index], ...updates, editing: false }
    }
  }

  function acceptAll() {
    suggestions.value.forEach((s) => { s.accepted = true })
  }

  function reset() {
    prompt.value = ''
    suggestions.value = []
    hasGenerated.value = false
    error.value = null
  }

  const pendingSuggestions = computed(() =>
    suggestions.value.filter((s) => !s.accepted)
  )

  const acceptedSuggestions = computed(() =>
    suggestions.value.filter((s) => s.accepted)
  )

  return {
    prompt,
    loading,
    error,
    suggestions,
    hasGenerated,
    pendingSuggestions,
    acceptedSuggestions,
    generate,
    acceptSuggestion,
    dismissSuggestion,
    updateSuggestion,
    acceptAll,
    reset,
  }
}
