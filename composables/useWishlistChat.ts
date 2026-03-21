interface ChatMessage {
  id: number
  wishlistItemId: number
  guestName: string | null
  content: string
  createdAt: string
  isMe: boolean
}

interface Contributor {
  guestName: string | null
  amountCents: number | null
  isMe: boolean
}

export default function useWishlistChat(token: string) {
  const messages = ref<ChatMessage[]>([])
  const contributors = ref<Contributor[]>([])
  const loading = ref(false)
  const sending = ref(false)
  const error = ref<string | null>(null)

  let pollInterval: ReturnType<typeof setInterval> | null = null
  let activeItemId: number | null = null

  async function fetchChat(itemId: number) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ messages: ChatMessage[], contributors: Contributor[] }>(
        `/api/invite/${token}/wishlist/${itemId}/messages`,
      )
      messages.value = data.messages || []
      contributors.value = data.contributors || []
    } catch {
      error.value = 'Failed to load chat'
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(itemId: number, content: string) {
    if (!content.trim()) return
    sending.value = true
    try {
      const message = await $fetch<ChatMessage>(
        `/api/invite/${token}/wishlist/${itemId}/messages`,
        { method: 'POST', body: { content } },
      )
      messages.value.push(message)
      return message
    } catch {
      error.value = 'Failed to send message'
    } finally {
      sending.value = false
    }
  }

  function startPolling(itemId: number) {
    stopPolling()
    activeItemId = itemId
    fetchChat(itemId)
    pollInterval = setInterval(() => {
      if (activeItemId === itemId) {
        fetchChat(itemId)
      }
    }, 10000)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
    activeItemId = null
  }

  onUnmounted(() => {
    stopPolling()
  })

  return {
    messages,
    contributors,
    loading,
    sending,
    error,
    fetchChat,
    sendMessage,
    startPolling,
    stopPolling,
  }
}
