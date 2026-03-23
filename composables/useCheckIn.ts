interface CheckInStats {
  total: number
  checkedIn: number
}

interface CheckedInGuest {
  id: string | null
  eventId: string
  inviteeEmail: string
  inviteeName: string | null
  status: string
  accessToken: string
  checkedInAt: string | null
}

interface ScanResult {
  success: boolean
  guest?: CheckedInGuest
  error?: string
}

export function useCheckIn(eventId: number | string) {
  const stats = ref<CheckInStats>({ total: 0, checkedIn: 0 })
  const recentCheckIns = ref<CheckedInGuest[]>([])
  const loading = ref(false)
  const lastScanResult = ref<ScanResult | null>(null)

  const percentage = computed(() => {
    if (stats.value.total === 0) return 0
    return Math.round((stats.value.checkedIn / stats.value.total) * 100)
  })

  async function fetchStats() {
    try {
      const data = await $fetch<CheckInStats>(`/api/events/${eventId}/check-in/stats`)
      stats.value = data
    } catch {
      // Stats fetch failure shouldn't block the UI
    }
  }

  async function fetchCheckedInGuests() {
    loading.value = true
    try {
      const data = await $fetch<CheckedInGuest[]>(`/api/events/${eventId}/check-in/guests`)
      recentCheckIns.value = data
    } finally {
      loading.value = false
    }
  }

  async function checkInByToken(accessToken: string) {
    try {
      const guest = await $fetch<CheckedInGuest>(`/api/events/${eventId}/check-in/scan`, {
        method: 'POST',
        body: { accessToken },
      })
      lastScanResult.value = { success: true, guest }
      await Promise.all([fetchStats(), fetchCheckedInGuests()])
      return guest
    } catch (err: any) {
      const message = err?.data?.statusMessage || err?.statusMessage || 'Check-in failed'
      lastScanResult.value = { success: false, error: message }
      throw err
    }
  }

  async function undoCheckIn(invitationId: number | string) {
    await $fetch(`/api/events/${eventId}/check-in/${invitationId}/undo`, {
      method: 'POST',
    })
    await Promise.all([fetchStats(), fetchCheckedInGuests()])
  }

  function extractTokenFromUrl(scannedUrl: string): string | null {
    const match = scannedUrl.match(/\/invite\/([a-f0-9]+)/)
    return match ? match[1] : null
  }

  return {
    stats,
    recentCheckIns,
    loading,
    lastScanResult,
    percentage,
    fetchStats,
    fetchCheckedInGuests,
    checkInByToken,
    undoCheckIn,
    extractTokenFromUrl,
  }
}
