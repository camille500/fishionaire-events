<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
  currentImage: {
    type: String,
    default: null,
  },
  editable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['updated'])

const uploading = ref(false)
const error = ref('')
const imageUrl = ref(props.currentImage)
const dragOver = ref(false)
const fileInput = ref(null)

watch(() => props.currentImage, (val) => {
  imageUrl.value = val
})

function onDragOver(e) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e) {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) upload(file)
}

function onFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) upload(file)
  e.target.value = ''
}

async function upload(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    error.value = t('dashboard.eventEditor.coverImage.invalidType')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = t('dashboard.eventEditor.coverImage.tooLarge')
    return
  }

  uploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('image', file)

    const result = await $fetch(`/api/events/${props.eventId}/cover-image`, {
      method: 'POST',
      body: formData,
    })
    imageUrl.value = result.coverImageUrl
    emit('updated', result.coverImageUrl)
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.eventEditor.coverImage.uploadError')
  } finally {
    uploading.value = false
  }
}

async function remove() {
  uploading.value = true
  error.value = ''

  try {
    await $fetch(`/api/events/${props.eventId}/cover-image`, {
      method: 'DELETE',
    })
    imageUrl.value = null
    emit('updated', null)
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.eventEditor.coverImage.deleteError')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="cover-uploader">
    <!-- Preview -->
    <div v-if="imageUrl" class="cover-uploader__preview">
      <img :src="imageUrl" :alt="t('dashboard.eventEditor.coverImage.alt')" class="cover-uploader__image" />
      <div v-if="editable" class="cover-uploader__overlay">
        <AppButton variant="ghost" size="sm" class="cover-uploader__action" @click="fileInput?.click()">
          <Icon name="lucide:pencil" size="14" />
          {{ t('dashboard.eventEditor.coverImage.change') }}
        </AppButton>
        <AppButton variant="ghost" size="sm" class="cover-uploader__action cover-uploader__action--danger" @click="remove" :disabled="uploading">
          <Icon name="lucide:trash-2" size="14" />
          {{ t('dashboard.eventEditor.coverImage.remove') }}
        </AppButton>
      </div>
    </div>

    <!-- Drop zone -->
    <div
      v-else-if="editable"
      class="cover-uploader__dropzone"
      :class="{ 'cover-uploader__dropzone--active': dragOver, 'cover-uploader__dropzone--uploading': uploading }"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="fileInput?.click()"
    >
      <Icon v-if="uploading" name="lucide:loader-2" size="24" class="cover-uploader__spinner" />
      <Icon v-else name="lucide:image-plus" size="24" />
      <AppText size="sm" weight="semibold">
        {{ uploading ? t('dashboard.eventEditor.coverImage.uploading') : t('dashboard.eventEditor.coverImage.dropzone') }}
      </AppText>
      <AppText size="xs" muted>
        {{ t('dashboard.eventEditor.coverImage.hint') }}
      </AppText>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="cover-uploader__input"
      @change="onFileSelect"
    />

    <AppText v-if="error" size="sm" class="cover-uploader__error">{{ error }}</AppText>
  </div>
</template>

<style scoped>
.cover-uploader__preview {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  aspect-ratio: 21 / 9;
}

.cover-uploader__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-uploader__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.cover-uploader__preview:hover .cover-uploader__overlay {
  opacity: 1;
}

.cover-uploader__action {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}

.cover-uploader__action:hover {
  background: rgba(255, 255, 255, 0.25);
}

.cover-uploader__action--danger:hover {
  background: rgba(239, 68, 68, 0.4);
}

.cover-uploader__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-10) var(--space-6);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  aspect-ratio: 21 / 9;
}

.cover-uploader__dropzone:hover,
.cover-uploader__dropzone--active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 5%, transparent);
  color: var(--color-accent);
}

.cover-uploader__dropzone--uploading {
  pointer-events: none;
  opacity: 0.7;
}

.cover-uploader__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.cover-uploader__input {
  display: none;
}

.cover-uploader__error {
  color: var(--color-accent-dark);
  margin-top: var(--space-2);
}
</style>
