<script setup>
const { t } = useI18n()

const props = defineProps({
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024,
  },
  progress: {
    type: Number,
    default: 0,
  },
  isUploading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['uploaded'])

const dragging = ref(false)
const uploading = ref(false)
const error = ref('')
const fileInput = ref(null)

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function validateFile(file) {
  if (!allowedTypes.includes(file.type)) {
    error.value = t('gallery.invalidType')
    return false
  }
  if (file.size > props.maxSize) {
    error.value = t('gallery.tooLarge')
    return false
  }
  return true
}

async function handleFiles(files) {
  error.value = ''
  const validFiles = Array.from(files).filter(validateFile)
  if (validFiles.length === 0) return

  uploading.value = true
  try {
    for (const file of validFiles) {
      emit('uploaded', file)
    }
  } finally {
    uploading.value = false
  }
}

function onDrop(e) {
  dragging.value = false
  if (e.dataTransfer?.files?.length) {
    handleFiles(e.dataTransfer.files)
  }
}

function onDragOver(e) {
  e.preventDefault()
  dragging.value = true
}

function onDragLeave() {
  dragging.value = false
}

function onClick() {
  fileInput.value?.click()
}

function onFileChange(e) {
  if (e.target.files?.length) {
    handleFiles(e.target.files)
    e.target.value = ''
  }
}
</script>

<template>
  <div
    class="gallery-uploader"
    :class="{ 'gallery-uploader--dragging': dragging, 'gallery-uploader--uploading': uploading }"
    @drop.prevent="onDrop"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @click="onClick"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      multiple
      class="gallery-uploader__input"
      @change="onFileChange"
    />

    <div v-if="uploading || isUploading" class="gallery-uploader__status">
      <Icon name="lucide:loader-2" size="24" class="gallery-uploader__spinner" />
      <span>{{ t('gallery.uploading') }}</span>
      <div v-if="progress > 0" class="gallery-uploader__progress">
        <div class="gallery-uploader__progress-bar" :style="{ width: progress + '%' }" />
      </div>
    </div>
    <div v-else class="gallery-uploader__content">
      <Icon name="lucide:upload-cloud" size="28" class="gallery-uploader__icon" />
      <span class="gallery-uploader__label">{{ t('gallery.dropzone') }}</span>
      <span class="gallery-uploader__hint">{{ t('gallery.hint') }}</span>
    </div>

    <p v-if="error" class="gallery-uploader__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.gallery-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-4);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-surface);
  text-align: center;
}

.gallery-uploader:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 4%, transparent);
}

.gallery-uploader--dragging {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  transform: scale(1.01);
}

.gallery-uploader--uploading {
  pointer-events: none;
  opacity: 0.7;
}

.gallery-uploader__input {
  display: none;
}

.gallery-uploader__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.gallery-uploader__icon {
  color: var(--color-text-muted);
}

.gallery-uploader__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.gallery-uploader__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.gallery-uploader__status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.gallery-uploader__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gallery-uploader__progress {
  width: 100%;
  max-width: 200px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border-light);
  overflow: hidden;
}

.gallery-uploader__progress-bar {
  height: 100%;
  border-radius: 2px;
  background: var(--color-accent);
  transition: width 200ms ease;
}

.gallery-uploader__error {
  font-size: var(--text-xs);
  color: var(--color-error, #e74c3c);
  margin: var(--space-2) 0 0;
}
</style>
