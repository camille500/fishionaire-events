export interface UserSearchResult {
  clerkId: string
  displayName: string
  email: string
  avatarUrl: string | null
}

export function useUserSearch() {
  const query = ref('')
  const results = ref<UserSearchResult[]>([])
  const loading = ref(false)
  const isOpen = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function search(q: string) {
    if (q.length < 2) {
      results.value = []
      isOpen.value = false
      return
    }

    loading.value = true
    try {
      const data = await $fetch<UserSearchResult[]>('/api/users/search', {
        query: { q },
      })
      results.value = data || []
      isOpen.value = true
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
    debounceTimer = setTimeout(() => search(value), 300)
  }

  function selectResult(result: UserSearchResult) {
    query.value = ''
    results.value = []
    isOpen.value = false
  }

  function close() {
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
