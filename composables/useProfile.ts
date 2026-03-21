export function useProfile() {
  const { data: profile, refresh, status } = useFetch('/api/users/me')

  const saving = ref(false)
  const error = ref('')

  async function updateProfile(data: {
    displayName?: string | null
    bio?: string | null
    website?: string | null
    socialInstagram?: string | null
    socialTwitter?: string | null
    socialLinkedin?: string | null
    profileVisible?: boolean
  }) {
    saving.value = true
    error.value = ''
    try {
      await $fetch('/api/users/me/profile', { method: 'PUT', body: data })
      await refresh()
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to update profile'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function uploadAvatar(file: Blob) {
    saving.value = true
    error.value = ''
    try {
      const formData = new FormData()
      formData.append('image', file)
      const result = await $fetch<{ avatarUrl: string }>('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
      })
      await refresh()
      return result
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to upload avatar'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function deleteAvatar() {
    saving.value = true
    error.value = ''
    try {
      await $fetch('/api/users/me/avatar', { method: 'DELETE' })
      await refresh()
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to delete avatar'
      throw e
    } finally {
      saving.value = false
    }
  }

  return {
    profile,
    loading: computed(() => status.value === 'pending'),
    saving,
    error,
    refresh,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  }
}
