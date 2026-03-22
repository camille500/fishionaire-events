<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: [Number, String],
    required: true,
  },
  features: {
    type: Object,
    default: () => ({}),
  },
})

const { photos, loading, uploading, fetchPhotos, uploadPhoto, deletePhoto, bulkDeletePhotos, setAsCover } = useGallery(props.eventId)

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const selectMode = ref(false)
const selectedIds = ref(new Set())

const guestUploadsEnabled = ref(true)
const savingToggle = ref(false)

onMounted(async () => {
  await fetchPhotos()
  // Load current guestUploadsEnabled from event
  try {
    const event = await $fetch(`/api/events/${props.eventId}`)
    guestUploadsEnabled.value = event.guestUploadsEnabled ?? true
  } catch {}
})

async function handleFileUploaded(file) {
  await uploadPhoto(file)
}

function openLightbox(photo) {
  const index = photos.value.findIndex((p) => p.id === photo.id)
  lightboxIndex.value = index >= 0 ? index : 0
  lightboxOpen.value = true
}

async function handleDelete(photoId) {
  await deletePhoto(photoId)
}

async function handleSetAsCover(photoId) {
  await setAsCover(photoId)
}

function toggleSelect(photoId) {
  if (selectedIds.value.has(photoId)) {
    selectedIds.value.delete(photoId)
  } else {
    selectedIds.value.add(photoId)
  }
}

function selectAll() {
  photos.value.forEach((p) => selectedIds.value.add(p.id))
}

function deselectAll() {
  selectedIds.value.clear()
}

async function deleteSelected() {
  const ids = Array.from(selectedIds.value)
  if (ids.length === 0) return
  await bulkDeletePhotos(ids)
  selectedIds.value.clear()
  selectMode.value = false
}

async function toggleGuestUploads() {
  savingToggle.value = true
  const newValue = !guestUploadsEnabled.value
  try {
    await $fetch(`/api/events/${props.eventId}`, {
      method: 'PUT',
      body: { guestUploadsEnabled: newValue },
    })
    guestUploadsEnabled.value = newValue
  } catch {}
  savingToggle.value = false
}
</script>

<template>
  <div class="photos-tab">
    <GalleryUploader @uploaded="handleFileUploaded" />

    <div class="photos-tab__controls">
      <div class="photos-tab__toggle">
        <AppSwitch
          :model-value="guestUploadsEnabled"
          :label="t('gallery.guestUploads')"
          :description="t('gallery.guestUploadsDescription')"
          :disabled="savingToggle"
          @update:model-value="toggleGuestUploads"
        />
      </div>

      <div v-if="photos.length > 0" class="photos-tab__actions">
        <AppButton
          v-if="!selectMode"
          variant="ghost"
          size="sm"
          @click="selectMode = true"
        >
          <Icon name="lucide:check-square" size="14" />
          {{ t('gallery.selectAll') }}
        </AppButton>
        <template v-else>
          <AppButton variant="ghost" size="sm" @click="selectAll">
            {{ t('gallery.selectAll') }}
          </AppButton>
          <AppButton variant="ghost" size="sm" @click="deselectAll">
            {{ t('gallery.deselectAll') }}
          </AppButton>
          <AppButton
            v-if="selectedIds.size > 0"
            variant="danger"
            size="sm"
            @click="deleteSelected"
          >
            <Icon name="lucide:trash-2" size="14" />
            {{ t('gallery.deleteSelected') }} ({{ selectedIds.size }})
          </AppButton>
          <AppButton variant="ghost" size="sm" @click="selectMode = false; deselectAll()">
            <Icon name="lucide:x" size="14" />
          </AppButton>
        </template>
      </div>
    </div>

    <div v-if="loading" class="photos-tab__loading">
      <Icon name="lucide:loader-2" size="24" class="photos-tab__spinner" />
    </div>

    <div v-else-if="photos.length === 0" class="photos-tab__empty">
      <Icon name="lucide:camera" size="32" class="photos-tab__empty-icon" />
      <AppHeading :level="3">{{ t('gallery.empty') }}</AppHeading>
      <AppText size="sm" muted>{{ t('gallery.emptyDescription') }}</AppText>
    </div>

    <div v-else class="photos-tab__grid">
      <GalleryPhotoCard
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :editable="true"
        :selectable="selectMode"
        :selected="selectedIds.has(photo.id)"
        @open="openLightbox"
        @delete="handleDelete"
        @set-cover="handleSetAsCover"
        @toggle-select="toggleSelect"
      />
    </div>

    <GalleryLightbox
      v-if="lightboxOpen"
      :photos="photos"
      :initial-index="lightboxIndex"
      @close="lightboxOpen = false"
    />
  </div>
</template>

<style scoped>
.photos-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.photos-tab__controls {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.photos-tab__toggle {
  flex: 1;
  min-width: 240px;
}

.photos-tab__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.photos-tab__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-3);
}

.photos-tab__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.photos-tab__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.photos-tab__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.photos-tab__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
  margin-bottom: var(--space-2);
}

@media (max-width: 768px) {
  .photos-tab__grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-2);
  }
}
</style>
