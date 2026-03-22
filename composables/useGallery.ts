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

export function useGallery(eventId: number | string) {
  const photos = ref<GalleryPhotoItem[]>([])
  const loading = ref(false)
  const uploading = ref(false)

  async function fetchPhotos() {
    loading.value = true
    try {
      const data = await $fetch<GalleryPhotoItem[]>(`/api/events/${eventId}/gallery`)
      photos.value = data
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

      const photo = await $fetch<GalleryPhotoItem>(`/api/events/${eventId}/gallery`, {
        method: 'POST',
        body: formData,
      })
      photos.value.push(photo)
      return photo
    } finally {
      uploading.value = false
    }
  }

  async function deletePhoto(photoId: number) {
    await $fetch(`/api/events/${eventId}/gallery/${photoId}`, { method: 'DELETE' })
    photos.value = photos.value.filter((p) => p.id !== photoId)
  }

  async function bulkDeletePhotos(ids: number[]) {
    await $fetch(`/api/events/${eventId}/gallery/bulk-delete`, {
      method: 'POST',
      body: { ids },
    })
    photos.value = photos.value.filter((p) => !ids.includes(p.id))
  }

  async function updateCaption(photoId: number, caption: string | null) {
    const updated = await $fetch<GalleryPhotoItem>(`/api/events/${eventId}/gallery/${photoId}/caption`, {
      method: 'PUT',
      body: { caption },
    })
    const index = photos.value.findIndex((p) => p.id === photoId)
    if (index >= 0) photos.value[index] = updated
  }

  async function setAsCover(photoId: number) {
    return $fetch<{ coverImageUrl: string }>(`/api/events/${eventId}/gallery/${photoId}/set-cover`, {
      method: 'POST',
    })
  }

  async function reorderPhotos(orderedIds: number[]) {
    const data = await $fetch<GalleryPhotoItem[]>(`/api/events/${eventId}/gallery/reorder`, {
      method: 'PUT',
      body: { orderedIds },
    })
    photos.value = data
  }

  return {
    photos,
    loading,
    uploading,
    fetchPhotos,
    uploadPhoto,
    deletePhoto,
    bulkDeletePhotos,
    updateCaption,
    setAsCover,
    reorderPhotos,
  }
}
