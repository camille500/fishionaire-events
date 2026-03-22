interface SocialWallPostItem {
  id: number
  eventId: number
  guestEmail: string
  guestName: string | null
  content: string
  imageUrl: string | null
  status: string
  hearts: number
  createdAt: string
}

export function useGuestSocialWall(token: string) {
  const posts = ref<SocialWallPostItem[]>([])
  const loading = ref(false)
  const posting = ref(false)

  async function fetchPosts() {
    loading.value = true
    try {
      const data = await $fetch<{ posts: SocialWallPostItem[] }>(`/api/invite/${token}/social-wall`)
      posts.value = data.posts
    } finally {
      loading.value = false
    }
  }

  async function createPost(content: string, file?: File) {
    posting.value = true
    try {
      let result: SocialWallPostItem

      if (file) {
        const formData = new FormData()
        formData.append('content', content)
        formData.append('image', file)
        result = await $fetch<SocialWallPostItem>(`/api/invite/${token}/social-wall`, {
          method: 'POST',
          body: formData,
        })
      } else {
        result = await $fetch<SocialWallPostItem>(`/api/invite/${token}/social-wall`, {
          method: 'POST',
          body: { content },
        })
      }

      // Only add to list if auto-approved (status = approved)
      if (result.status === 'approved') {
        posts.value.unshift(result)
      }

      return result
    } finally {
      posting.value = false
    }
  }

  async function heartPost(postId: number) {
    // Optimistic update
    const post = posts.value.find((p) => p.id === postId)
    if (post) post.hearts++

    try {
      const data = await $fetch<{ hearts: number }>(`/api/invite/${token}/social-wall/${postId}/heart`, {
        method: 'POST',
      })
      if (post) post.hearts = data.hearts
    } catch {
      // Revert optimistic update
      if (post) post.hearts--
    }
  }

  return {
    posts,
    loading,
    posting,
    fetchPosts,
    createPost,
    heartPost,
  }
}
