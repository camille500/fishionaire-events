interface NotificationItem {
  id: number
  userClerkId: string
  eventId: number | null
  type: string
  title: string
  body: string
  linkUrl: string | null
  metadata: Record<string, unknown> | null
  isRead: boolean
  createdAt: string
}

interface NotificationsResponse {
  notifications: NotificationItem[]
  unreadCount: number
}

export function useNotifications() {
  const notifications = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  let pollInterval: ReturnType<typeof setInterval> | null = null

  async function fetchCount() {
    try {
      const data = await $fetch<{ count: number }>('/api/notifications/count')
      unreadCount.value = data.count
    } catch {
      // Silently fail — badge just won't update
    }
  }

  async function fetchNotifications(opts: { limit?: number, offset?: number, unreadOnly?: boolean } = {}) {
    loading.value = true
    try {
      const data = await $fetch<NotificationsResponse>('/api/notifications', {
        params: {
          limit: opts.limit || 20,
          offset: opts.offset || 0,
          unreadOnly: opts.unreadOnly ? 'true' : undefined,
        },
      })
      notifications.value = data.notifications
      unreadCount.value = data.unreadCount
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: number) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) notification.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)

    try {
      await $fetch(`/api/notifications/${id}`, { method: 'PUT' })
    } catch {
      // Revert optimistic update on failure
      if (notification) notification.isRead = false
      unreadCount.value += 1
    }
  }

  async function markAllAsRead() {
    const previousStates = notifications.value.map((n) => ({ id: n.id, isRead: n.isRead }))
    const previousCount = unreadCount.value
    notifications.value.forEach((n) => { n.isRead = true })
    unreadCount.value = 0

    try {
      await $fetch('/api/notifications/read-all', { method: 'POST' })
    } catch {
      // Revert
      for (const prev of previousStates) {
        const n = notifications.value.find((x) => x.id === prev.id)
        if (n) n.isRead = prev.isRead
      }
      unreadCount.value = previousCount
    }
  }

  function startPolling() {
    fetchCount()
    pollInterval = setInterval(fetchCount, 30000)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  onMounted(startPolling)
  onUnmounted(stopPolling)

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchCount,
    markAsRead,
    markAllAsRead,
  }
}
