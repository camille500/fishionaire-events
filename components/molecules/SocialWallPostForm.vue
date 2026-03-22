<script setup>
const { t } = useI18n()

defineProps({
  posting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const content = ref('')
const imageFile = ref(null)
const imagePreview = ref(null)
const fileInput = ref(null)

const charCount = computed(() => content.value.length)
const isOverLimit = computed(() => charCount.value > 500)
const canSubmit = computed(() => content.value.trim().length > 0 && !isOverLimit.value)

function handleImageSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) return

  if (file.size > 10 * 1024 * 1024) return

  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imageFile.value = null
  imagePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit', { content: content.value.trim(), file: imageFile.value || undefined })
  content.value = ''
  removeImage()
}

onUnmounted(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
})
</script>

<template>
  <div class="post-form">
    <textarea
      v-model="content"
      class="post-form__textarea"
      :class="{ 'post-form__textarea--over': isOverLimit }"
      :placeholder="t('socialWall.placeholder')"
      rows="3"
      maxlength="600"
      :disabled="posting"
    />

    <div v-if="imagePreview" class="post-form__preview">
      <img :src="imagePreview" alt="" class="post-form__preview-image" />
      <button class="post-form__preview-remove" @click="removeImage">
        <Icon name="lucide:x" size="14" />
      </button>
    </div>

    <div class="post-form__footer">
      <div class="post-form__actions">
        <button class="post-form__photo-btn" :disabled="posting" @click="fileInput?.click()">
          <Icon name="lucide:image" size="16" />
          {{ t('socialWall.addPhoto') }}
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          class="post-form__file-input"
          @change="handleImageSelect"
        />
      </div>
      <div class="post-form__right">
        <span class="post-form__char-count" :class="{ 'post-form__char-count--over': isOverLimit }">
          {{ charCount }}/500
        </span>
        <AppButton
          variant="primary"
          size="sm"
          :disabled="!canSubmit || posting"
          @click="handleSubmit"
        >
          <Icon v-if="posting" name="lucide:loader-2" size="14" class="post-form__spinner" />
          {{ posting ? t('socialWall.posting') : t('socialWall.post') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface, var(--color-background));
}

.post-form__textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  background: var(--color-background);
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color var(--transition-fast);
}

.post-form__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.post-form__textarea--over {
  border-color: var(--color-error, #e74c3c);
}

.post-form__textarea:disabled {
  opacity: 0.6;
}

.post-form__preview {
  position: relative;
  display: inline-block;
}

.post-form__preview-image {
  max-height: 150px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.post-form__preview-remove {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.post-form__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.post-form__photo-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.post-form__photo-btn:hover:not(:disabled) {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.post-form__photo-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.post-form__file-input {
  display: none;
}

.post-form__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.post-form__char-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.post-form__char-count--over {
  color: var(--color-error, #e74c3c);
  font-weight: var(--font-weight-medium);
}

.post-form__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
