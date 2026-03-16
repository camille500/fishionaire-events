import { useDebounceFn } from '@vueuse/core'

export default function useProductSearch(eventId: string | number) {
  const query = ref('')
  const results = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const category = ref<string | null>(null)

  const doSearch = useDebounceFn(async () => {
    if (query.value.trim().length < 2 && !category.value) {
      results.value = []
      return
    }
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (query.value.trim()) params.set('q', query.value.trim())
      if (category.value) params.set('category', category.value)

      const data = await $fetch<Record<string, unknown>[]>(`/api/events/${eventId}/wishlist/search?${params}`)
      results.value = data
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)

  watch([query, category], () => doSearch())

  function clear() {
    query.value = ''
    results.value = []
    category.value = null
  }

  return {
    query,
    results,
    loading,
    category,
    clear,
  }
}
