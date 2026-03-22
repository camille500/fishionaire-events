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
  const uploadProgress = ref(0)
  const uploadError = ref<string | null>(null)
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

  function uploadPhoto(file: File, caption?: string): Promise<GalleryPhotoItem> {
    uploading.value = true
    uploadProgress.value = 0
    uploadError.value = null

    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('image', file)
      if (caption) formData.append('caption', caption)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/invite/${token}/gallery`)

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          uploadProgress.value = Math.round((e.loaded / e.total) * 100)
        }
      })

      xhr.addEventListener('load', () => {
        uploading.value = false
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const photo = JSON.parse(xhr.responseText) as GalleryPhotoItem
            photos.value.push(photo)
            resolve(photo)
          } catch {
            uploadError.value = 'Upload failed'
            reject(new Error('Upload failed'))
          }
        } else {
          uploadError.value = 'Upload failed'
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        uploading.value = false
        uploadError.value = 'Upload failed'
        reject(new Error('Upload failed'))
      })

      xhr.send(formData)
    })
  }

  return {
    photos,
    loading,
    uploading,
    uploadProgress,
    uploadError,
    guestUploadsEnabled,
    fetchGallery,
    uploadPhoto,
  }
}
