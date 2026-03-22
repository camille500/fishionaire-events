interface BudgetEntryItem {
  id: number
  eventId: number
  description: string
  amountCents: number
  currency: string
  category: string
  paidAt: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface BudgetStatsData {
  totalSpentCents: number
  entryCount: number
  budgetTargetCents: number | null
  budgetCurrency: string
  remainingCents: number | null
  categoryBreakdown: Array<{ category: string, totalCents: number, count: number }>
}

export function useBudget(eventId: number | string) {
  const entries = ref<BudgetEntryItem[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const stats = ref<BudgetStatsData>({
    totalSpentCents: 0,
    entryCount: 0,
    budgetTargetCents: null,
    budgetCurrency: 'EUR',
    remainingCents: null,
    categoryBreakdown: [],
  })

  const spentPercentage = computed(() => {
    if (!stats.value.budgetTargetCents || stats.value.budgetTargetCents <= 0) return 0
    return Math.round((stats.value.totalSpentCents / stats.value.budgetTargetCents) * 100)
  })

  const budgetStatus = computed(() => {
    if (!stats.value.budgetTargetCents) return 'under'
    if (spentPercentage.value >= 100) return 'over'
    if (spentPercentage.value >= 80) return 'approaching'
    return 'under'
  })

  const largestCategory = computed(() => {
    if (stats.value.categoryBreakdown.length === 0) return null
    return stats.value.categoryBreakdown[0]
  })

  async function fetchEntries() {
    loading.value = true
    try {
      const data = await $fetch<BudgetEntryItem[]>(`/api/events/${eventId}/budget`)
      entries.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const data = await $fetch<BudgetStatsData>(`/api/events/${eventId}/budget/stats`)
      stats.value = data
    } catch {
      // Stats fetch failure shouldn't block the UI
    }
  }

  async function createEntry(data: {
    description: string
    amountCents: number
    currency?: string
    category: string
    paidAt?: string
    notes?: string
  }) {
    saving.value = true
    try {
      const entry = await $fetch<BudgetEntryItem>(`/api/events/${eventId}/budget`, {
        method: 'POST',
        body: data,
      })
      entries.value.unshift(entry)
      await fetchStats()
      return entry
    } finally {
      saving.value = false
    }
  }

  async function updateEntry(entryId: number, data: Record<string, unknown>) {
    saving.value = true
    try {
      const updated = await $fetch<BudgetEntryItem>(`/api/events/${eventId}/budget/${entryId}`, {
        method: 'PUT',
        body: data,
      })
      const index = entries.value.findIndex((e) => e.id === entryId)
      if (index >= 0) entries.value[index] = updated
      await fetchStats()
      return updated
    } finally {
      saving.value = false
    }
  }

  async function deleteEntry(entryId: number) {
    await $fetch(`/api/events/${eventId}/budget/${entryId}`, { method: 'DELETE' })
    entries.value = entries.value.filter((e) => e.id !== entryId)
    await fetchStats()
  }

  async function updateBudgetTarget(targetCents: number | null, currency?: string) {
    saving.value = true
    try {
      await $fetch(`/api/events/${eventId}/budget/target`, {
        method: 'PUT',
        body: { targetCents, currency },
      })
      await fetchStats()
    } finally {
      saving.value = false
    }
  }

  return {
    entries,
    loading,
    saving,
    stats,
    spentPercentage,
    budgetStatus,
    largestCategory,
    fetchEntries,
    fetchStats,
    createEntry,
    updateEntry,
    deleteEntry,
    updateBudgetTarget,
  }
}
