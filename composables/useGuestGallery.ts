interface GalleryPhotoItem {
  id: number
  eventId: number
  imageUrl: string
  imageKey: string
  caption: string | null
  uploaderEmail: string | null
  uploaderName: string | null
  uploadedBy: string
  sortOrder: number
  createdAt: string
}

interface GuestGalleryResponse {
  photos: GalleryPhotoItem[]
  guestUploadsEnabled: boolean
}

export function useGuestGallery(token: string) {
  const photos = ref<GalleryPhotoItem[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const guestUploadsEnabled = ref(false)

  async function fetchGallery() {
    loading.value = true
    try {
      const data = await $fetch<GuestGalleryResponse>(`/api/invite/${token}/gallery`)
      photos.value = data.photos
      guestUploadsEnabled.value = data.guestUploadsEnabled
    } finally {
      loading.value = false
    }
  }

  async function uploadPhoto(file: File, caption?: string) {
    uploading.value = true
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (caption) formData.append('caption', caption)

      const photo = await $fetch<GalleryPhotoItem>(`/api/invite/${token}/gallery`, {
        method: 'POST',
        body: formData,
      })
      photos.value.push(photo)
      return photo
    } finally {
      uploading.value = false
    }
  }

  return {
    photos,
    loading,
    uploading,
    guestUploadsEnabled,
    fetchGallery,
    uploadPhoto,
  }
}
