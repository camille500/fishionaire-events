<script setup>
const { t } = useI18n()

const props = defineProps({
  token: {
    type: String,
    required: true,
  },
  eventData: {
    type: Object,
    default: null,
  },
})

const toast = useToast()
const { t } = useI18n()
const { photos, loading, uploading, uploadProgress, uploadError, guestUploadsEnabled, fetchGallery, uploadPhoto } = useGuestGallery(props.token)

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const uploadSuccess = ref(false)

onMounted(() => {
  fetchGallery()
})

function openLightbox(photo) {
  const index = photos.value.findIndex((p) => p.id === photo.id)
  lightboxIndex.value = index >= 0 ? index : 0
  lightboxOpen.value = true
}

async function handleFileUploaded(file) {
  try {
    await uploadPhoto(file)
    uploadSuccess.value = true
    setTimeout(() => { uploadSuccess.value = false }, 3000)
  } catch {
    toast.add({ title: t('toast.uploadFailed'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}
</script>

<template>
  <div class="invite-gallery">
    <div v-if="loading" class="invite-gallery__loading">
      <Icon name="lucide:loader-2" size="20" class="invite-gallery__spinner" />
    </div>

    <template v-else>
      <div v-if="photos.length === 0 && !guestUploadsEnabled" class="invite-gallery__empty">
        <AppText size="sm" muted>{{ t('invite.gallery.empty') }}</AppText>
      </div>

      <div v-if="photos.length > 0" class="invite-gallery__grid">
        <GalleryPhotoCard
          v-for="photo in photos"
          :key="photo.id"
          :photo="photo"
          @open="openLightbox"
        />
      </div>

      <div v-if="guestUploadsEnabled" class="invite-gallery__upload">
        <GalleryUploader :is-uploading="uploading" :progress="uploadProgress" @uploaded="handleFileUploaded" />
        <p v-if="uploadSuccess" class="invite-gallery__success">
          <Icon name="lucide:check" size="14" />
          {{ t('invite.gallery.uploadSuccess') }}
        </p>
      </div>
    </template>

    <GalleryLightbox
      v-if="lightboxOpen"
      :photos="photos"
      :initial-index="lightboxIndex"
      @close="lightboxOpen = false"
    />
  </div>
</template>

<style scoped>
.invite-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.invite-gallery__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.invite-gallery__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.invite-gallery__empty {
  text-align: center;
  padding: var(--space-4);
}

.invite-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-3);
}

.invite-gallery__upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.invite-gallery__success {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-success, var(--color-accent));
  font-weight: var(--font-weight-medium);
  margin: 0;
}

@media (max-width: 768px) {
  .invite-gallery__grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-2);
  }
}
</style>
