export default function useWishlist(eventId: string | number) {
  const items = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const stats = ref<{ totalItems: number, claimedItems: number, totalPooledCents: number }>({ totalItems: 0, claimedItems: 0, totalPooledCents: 0 })

  const categories = computed(() => {
    const cats = new Set(items.value.map((i) => i.category as string).filter(Boolean))
    return [...cats]
  })

  async function fetchItems() {
    loading.value = true
    try {
      const data = await $fetch<Record<string, unknown>[]>(`/api/events/${eventId}/wishlist`)
      items.value = data
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const data = await $fetch<{ totalItems: number, claimedItems: number, totalPooledCents: number }>(`/api/events/${eventId}/wishlist/stats`)
      stats.value = data
    } catch {
      // silently fail
    }
  }

  async function createItem(params: Record<string, unknown>) {
    saving.value = true
    try {
      const created = await $fetch<Record<string, unknown>>(`/api/events/${eventId}/wishlist`, {
        method: 'POST',
        body: params,
      })
      items.value.push(created)
      stats.value.totalItems++
      return created
    } catch (err) {
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateItem(itemId: string | number, params: Record<string, unknown>) {
    saving.value = true
    try {
      const updated = await $fetch<Record<string, unknown>>(`/api/events/${eventId}/wishlist/${itemId}`, {
        method: 'PUT',
        body: params,
      })
      const idx = items.value.findIndex((i) => i.id === itemId)
      if (idx !== -1) items.value[idx] = { ...items.value[idx], ...updated }
      return updated
    } catch (err) {
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteItem(itemId: string | number) {
    try {
      await $fetch(`/api/events/${eventId}/wishlist/${itemId}`, { method: 'DELETE' })
      items.value = items.value.filter((i) => i.id !== itemId)
      stats.value.totalItems = Math.max(0, stats.value.totalItems - 1)
    } catch (err) {
      throw err
    }
  }

  async function reorderItems(orderedIds: (string | number)[]) {
    try {
      await $fetch(`/api/events/${eventId}/wishlist/reorder`, {
        method: 'PUT',
        body: { orderedIds },
      })
    } catch (err) {
      throw err
    }
  }

  async function bulkDeleteItems(ids: (string | number)[]) {
    try {
      await $fetch(`/api/events/${eventId}/wishlist/bulk-delete`, {
        method: 'POST',
        body: { ids },
      })
      items.value = items.value.filter((i) => !ids.includes(i.id as string | number))
      stats.value.totalItems = Math.max(0, stats.value.totalItems - ids.length)
    } catch (err) {
      throw err
    }
  }

  async function aiSuggest(params: { prompt: string, eventType?: string, eventTitle?: string, language?: string }) {
    return $fetch<{ suggestions: Array<{ title: string, description: string, priceCents: number, category: string }> }>(`/api/events/${eventId}/wishlist/ai-suggest`, {
      method: 'POST',
      body: {
        ...params,
        existingItems: items.value.map((i) => ({ title: i.title })),
      },
    })
  }

  return {
    items,
    loading,
    saving,
    stats,
    categories,
    fetchItems,
    fetchStats,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
    bulkDeleteItems,
    aiSuggest,
  }
}
