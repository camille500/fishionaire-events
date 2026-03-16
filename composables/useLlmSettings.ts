interface LlmSettingsData {
  aiTone: string | null
  aiToneCustom: string | null
  aiExtraContext: string | null
}

export function useLlmSettings() {
  const settings = ref<LlmSettingsData>({
    aiTone: null,
    aiToneCustom: null,
    aiExtraContext: null,
  })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function fetchAccountSettings() {
    loading.value = true
    error.value = ''
    try {
      const data = await $fetch<LlmSettingsData>('/api/users/me/llm-settings')
      settings.value = data
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to load AI settings'
    } finally {
      loading.value = false
    }
  }

  async function saveAccountSettings() {
    saving.value = true
    error.value = ''
    try {
      const data = await $fetch<LlmSettingsData>('/api/users/me/llm-settings', {
        method: 'PUT',
        body: settings.value,
      })
      settings.value = data
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to save AI settings'
    } finally {
      saving.value = false
    }
  }

  async function fetchEventSettings(eventId: string) {
    loading.value = true
    error.value = ''
    try {
      const data = await $fetch<LlmSettingsData>(`/api/events/${eventId}/llm-settings`)
      settings.value = data
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to load event AI settings'
    } finally {
      loading.value = false
    }
  }

  async function saveEventSettings(eventId: string) {
    saving.value = true
    error.value = ''
    try {
      const data = await $fetch<LlmSettingsData>(`/api/events/${eventId}/llm-settings`, {
        method: 'PUT',
        body: settings.value,
      })
      settings.value = data
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to save event AI settings'
    } finally {
      saving.value = false
    }
  }

  return {
    settings,
    loading,
    saving,
    error,
    fetchAccountSettings,
    saveAccountSettings,
    fetchEventSettings,
    saveEventSettings,
  }
}
