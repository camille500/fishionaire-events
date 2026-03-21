<script setup>
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['crop', 'close'])

const cropperRef = ref(null)

function onCrop() {
  const { canvas } = cropperRef.value.getResult()
  if (!canvas) return

  canvas.toBlob((blob) => {
    if (blob) emit('crop', blob)
  }, 'image/jpeg', 0.9)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="crop-modal" @click.self="emit('close')">
        <div class="crop-modal__card">
          <div class="crop-modal__header">
            <h3 class="crop-modal__title">{{ t('dashboard.profile.avatar.cropTitle') }}</h3>
            <button class="crop-modal__close" @click="emit('close')">
              <Icon name="lucide:x" size="18" />
            </button>
          </div>

          <div class="crop-modal__body">
            <Cropper
              ref="cropperRef"
              :src="image"
              :stencil-component="CircleStencil"
              :stencil-props="{ aspectRatio: 1 }"
              class="crop-modal__cropper"
            />
          </div>

          <div class="crop-modal__footer">
            <AppButton variant="ghost" size="sm" @click="emit('close')">
              {{ t('common.cancel') }}
            </AppButton>
            <AppButton variant="primary" size="sm" @click="onCrop">
              {{ t('common.save') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.crop-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: var(--space-4);
}

.crop-modal__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.crop-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-light);
}

.crop-modal__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.crop-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.crop-modal__close:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.crop-modal__body {
  padding: var(--space-4);
}

.crop-modal__cropper {
  height: 360px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.crop-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border-light);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-base);
}

.modal-enter-active .crop-modal__card,
.modal-leave-active .crop-modal__card {
  transition: transform var(--transition-base), opacity var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .crop-modal__card,
.modal-leave-to .crop-modal__card {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
