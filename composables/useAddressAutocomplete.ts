export interface AddressResult {
  displayName: string
  lat: string
  lon: string
  type: string
}

export function useAddressAutocomplete() {
  const { locale } = useI18n()

  const query = ref('')
  const results = ref<AddressResult[]>([])
  const loading = ref(false)
  const isOpen = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let lastRequestTime = 0

  async function search(q: string) {
    if (q.length < 3) {
      results.value = []
      isOpen.value = false
      return
    }

    // Respect Nominatim rate limit: 1 req/sec
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime
    if (timeSinceLastRequest < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLastRequest))
    }

    loading.value = true
    try {
      lastRequestTime = Date.now()
      const response = await $fetch<any[]>('https://nominatim.openstreetmap.org/search', {
        query: {
          q,
          format: 'json',
          addressdetails: '1',
          limit: '5',
        },
        headers: {
          'Accept-Language': locale.value || 'en',
          'User-Agent': 'FishionaireEvents/1.0',
        },
      })

      results.value = (response || []).map((item: any) => ({
        displayName: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type || '',
      }))
      isOpen.value = results.value.length > 0
    } catch {
      results.value = []
      isOpen.value = false
    } finally {
      loading.value = false
    }
  }

  function onInput(value: string) {
    query.value = value
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => search(value), 500)
  }

  function selectResult(result: AddressResult) {
    query.value = result.displayName
    results.value = []
    isOpen.value = false
  }

  function close() {
    // Small delay so click on result can fire first
    setTimeout(() => {
      isOpen.value = false
    }, 200)
  }

  function clear() {
    query.value = ''
    results.value = []
    isOpen.value = false
  }

  return {
    query,
    results,
    loading,
    isOpen,
    onInput,
    selectResult,
    close,
    clear,
  }
}
