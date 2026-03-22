interface SocialWallPostItem {
  id: number
  eventId: number
  guestEmail: string
  guestName: string | null
  content: string
  imageUrl: string | null
  imageKey: string | null
  status: string
  hearts: number
  createdAt: string
  updatedAt: string
}

interface SocialWallStats {
  total: number
  pending: number
  approved: number
}

export function useSocialWall(eventId: number | string) {
  const posts = ref<SocialWallPostItem[]>([])
  const loading = ref(false)
  const stats = ref<SocialWallStats>({ total: 0, pending: 0, approved: 0 })
  const statusFilter = ref<string>('all')

  const filteredPosts = computed(() => {
    if (statusFilter.value === 'all') return posts.value
    return posts.value.filter((p) => p.status === statusFilter.value)
  })

  async function fetchPosts() {
    loading.value = true
    try {
      const data = await $fetch<SocialWallPostItem[]>(`/api/events/${eventId}/social-wall`)
      posts.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const data = await $fetch<SocialWallStats>(`/api/events/${eventId}/social-wall/stats`)
      stats.value = data
    } catch {
      // Stats fetch failure shouldn't block the UI
    }
  }

  async function approvePost(postId: number) {
    const updated = await $fetch<SocialWallPostItem>(`/api/events/${eventId}/social-wall/${postId}/approve`, {
      method: 'POST',
    })
    const index = posts.value.findIndex((p) => p.id === postId)
    if (index >= 0) posts.value[index] = updated
    await fetchStats()
  }

  async function rejectPost(postId: number) {
    const updated = await $fetch<SocialWallPostItem>(`/api/events/${eventId}/social-wall/${postId}/reject`, {
      method: 'POST',
    })
    const index = posts.value.findIndex((p) => p.id === postId)
    if (index >= 0) posts.value[index] = updated
    await fetchStats()
  }

  async function deletePost(postId: number) {
    await $fetch(`/api/events/${eventId}/social-wall/${postId}`, { method: 'DELETE' })
    posts.value = posts.value.filter((p) => p.id !== postId)
    await fetchStats()
  }

  async function updateSettings(settings: { socialWallAutoApprove: boolean }) {
    await $fetch(`/api/events/${eventId}/social-wall/settings`, {
      method: 'PATCH',
      body: settings,
    })
  }

  return {
    posts,
    loading,
    stats,
    statusFilter,
    filteredPosts,
    fetchPosts,
    fetchStats,
    approvePost,
    rejectPost,
    deletePost,
    updateSettings,
  }
}
