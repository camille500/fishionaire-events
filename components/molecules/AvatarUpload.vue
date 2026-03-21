<script setup>
const { t } = useI18n()

const props = defineProps({
  src: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
  uploading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['upload'])

const fileInput = ref(null)
const cropImage = ref(null)
const showCropModal = ref(false)

function openFilePicker() {
  fileInput.value?.click()
}

function onFileSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''

  const reader = new FileReader()
  reader.onload = () => {
    cropImage.value = reader.result
    showCropModal.value = true
  }
  reader.readAsDataURL(file)
}

function onCrop(blob) {
  showCropModal.value = false
  cropImage.value = null
  emit('upload', blob)
}
</script>

<template>
  <div class="avatar-upload" @click="openFilePicker">
    <AvatarCircle
      :src="src"
      :name="name"
      size="2xl"
      ring
    />
    <div class="avatar-upload__overlay">
      <Icon v-if="!uploading" name="lucide:camera" size="24" />
      <Icon v-else name="lucide:loader-2" size="24" class="avatar-upload__spinner" />
    </div>
    <span class="avatar-upload__label">{{ t('dashboard.profile.avatar.change') }}</span>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="avatar-upload__input"
      @change="onFileSelect"
    />

    <ImageCropModal
      :visible="showCropModal"
      :image="cropImage"
      @crop="onCrop"
      @close="showCropModal = false"
    />
  </div>
</template>

<style scoped>
.avatar-upload {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.avatar-upload__overlay {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity var(--transition-fast);
  pointer-events: none;
}

.avatar-upload:hover .avatar-upload__overlay {
  opacity: 1;
}

.avatar-upload__label {
  font-size: var(--text-xs);
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}

.avatar-upload__input {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
}

.avatar-upload__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
