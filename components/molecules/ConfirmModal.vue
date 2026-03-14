<script setup>
const { t } = useI18n()

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  warning: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: '',
  },
  cancelLabel: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'danger'].includes(v),
  },
})

const emit = defineEmits(['confirm', 'close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="confirm-overlay" @click.self="emit('close')">
        <div class="confirm-modal" :class="{ 'confirm-modal--danger': variant === 'danger' }">
          <div class="confirm-modal__header">
            <Icon
              :name="variant === 'danger' ? 'lucide:alert-triangle' : 'lucide:help-circle'"
              size="22"
              :class="['confirm-modal__icon', { 'confirm-modal__icon--danger': variant === 'danger' }]"
            />
            <h3 class="confirm-modal__title">{{ title }}</h3>
          </div>

          <p class="confirm-modal__message">{{ message }}</p>

          <div v-if="warning" class="confirm-modal__warning">
            <Icon name="lucide:shield-alert" size="15" />
            <span>{{ warning }}</span>
          </div>

          <div class="confirm-modal__actions">
            <button class="confirm-modal__btn-cancel" @click="emit('close')">
              {{ cancelLabel || t('dashboard.cancel') }}
            </button>
            <AppButton
              :variant="variant === 'danger' ? 'primary' : 'primary'"
              size="sm"
              :class="{ 'confirm-modal__btn-danger': variant === 'danger' }"
              @click="emit('confirm')"
            >
              {{ confirmLabel || t('dashboard.confirm') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 16px;
  padding: var(--space-6);
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-xl);
}

.confirm-modal__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.confirm-modal__icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.confirm-modal__icon--danger {
  color: var(--color-error);
}

.confirm-modal__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.confirm-modal__message {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: var(--line-height-normal);
  margin: 0 0 var(--space-5);
}

.confirm-modal__warning {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-warning) 6%, transparent);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--space-5);
}

.confirm-modal__warning :deep(svg) {
  color: var(--color-warning);
  flex-shrink: 0;
  margin-top: 1px;
}

.confirm-modal__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-3);
}

.confirm-modal__btn-cancel {
  background: none;
  border: none;
  padding: var(--space-2) var(--space-3);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: color var(--transition-fast);
}

.confirm-modal__btn-cancel:hover {
  color: var(--color-text-primary);
}

.confirm-modal__btn-danger {
  background: var(--color-error) !important;
  border-color: var(--color-error) !important;
}

.confirm-modal__btn-danger:hover {
  background: color-mix(in srgb, var(--color-error) 85%, black) !important;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .confirm-modal,
.modal-leave-active .confirm-modal {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-modal,
.modal-leave-to .confirm-modal {
  transform: scale(0.96);
}
</style>
