export default function useGuestWishlist(token: string) {
  const items = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const claiming = ref<string | number | null>(null)

  const activeCategory = ref<string | null>(null)
  const activePriceRange = ref<string | null>(null)

  const categories = computed(() => {
    const cats = new Set(items.value.map((i) => i.category as string).filter(Boolean))
    return [...cats]
  })

  const filteredItems = computed(() => {
    let result = items.value
    if (activeCategory.value) {
      result = result.filter((i) => i.category === activeCategory.value)
    }
    if (activePriceRange.value) {
      const price = activePriceRange.value
      result = result.filter((i) => {
        const cents = (i.priceCents as number) || 0
        if (price === 'under25') return cents > 0 && cents < 2500
        if (price === '25to50') return cents >= 2500 && cents < 5000
        if (price === '50to100') return cents >= 5000 && cents < 10000
        if (price === 'over100') return cents >= 10000
        return true
      })
    }
    return result
  })

  const claimedCount = computed(() => items.value.filter((i) => (i.isClaimed || i.isFullyFunded)).length)
  const myClaimsCount = computed(() => items.value.filter((i) => i.myClaim).length)

  async function fetchWishlist() {
    loading.value = true
    try {
      const data = await $fetch<{ items: Record<string, unknown>[] }>(`/api/invite/${token}/wishlist`)
      items.value = data.items || []
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function claimItem(itemId: string | number, data?: { message?: string, amountCents?: number }) {
    claiming.value = itemId
    try {
      const claim = await $fetch(`/api/invite/${token}/wishlist/${itemId}/claim`, {
        method: 'POST',
        body: data || {},
      })
      // Update local state
      const idx = items.value.findIndex((i) => i.id === itemId)
      if (idx !== -1) {
        const item = items.value[idx]
        item.myClaim = claim
        item.claimCount = ((item.claimCount as number) || 0) + 1
        if (!item.isPoolable) item.isClaimed = true
      }
      return claim
    } finally {
      claiming.value = null
    }
  }

  async function unclaimItem(itemId: string | number) {
    claiming.value = itemId
    try {
      await $fetch(`/api/invite/${token}/wishlist/${itemId}/claim`, { method: 'DELETE' })
      const idx = items.value.findIndex((i) => i.id === itemId)
      if (idx !== -1) {
        const item = items.value[idx]
        item.myClaim = null
        item.claimCount = Math.max(0, ((item.claimCount as number) || 1) - 1)
        if (!item.isPoolable) item.isClaimed = (item.claimCount as number) > 0
      }
    } finally {
      claiming.value = null
    }
  }

  async function markPurchased(itemId: string | number) {
    const result = await $fetch(`/api/invite/${token}/wishlist/${itemId}/purchased`, {
      method: 'PUT',
    })
    const idx = items.value.findIndex((i) => i.id === itemId)
    if (idx !== -1) {
      items.value[idx].myClaim = result
    }
    return result
  }

  return {
    items,
    loading,
    claiming,
    activeCategory,
    activePriceRange,
    categories,
    filteredItems,
    claimedCount,
    myClaimsCount,
    fetchWishlist,
    claimItem,
    unclaimItem,
    markPurchased,
  }
}
