<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['saved', 'close'])

const name = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  if (!name.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/templates', {
      method: 'POST',
      body: { eventId: props.eventId, name: name.value.trim() },
    })
    name.value = ''
    emit('saved')
    emit('close')
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.eventEditor.errorSavingTemplate')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal__header">
          <AppHeading :level="3" size="sm">{{ t('dashboard.eventEditor.saveAsTemplate') }}</AppHeading>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="modal__field">
            <label class="modal__label">{{ t('dashboard.eventEditor.templateName') }}</label>
            <AppInput
              v-model="name"
              :placeholder="t('dashboard.eventEditor.templateNamePlaceholder')"
              :disabled="loading"
              autofocus
            />
          </div>
          <AppText v-if="error" size="sm" class="modal__error">{{ error }}</AppText>
          <div class="modal__actions">
            <AppButton variant="ghost" type="button" @click="emit('close')">
              {{ t('dashboard.cancel') }}
            </AppButton>
            <AppButton variant="primary" :disabled="loading || !name.trim()">
              {{ t('dashboard.eventEditor.saveAsTemplate') }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-xl);
}

.modal__header {
  margin-bottom: var(--space-4);
}

.modal__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
}

.modal__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.modal__error {
  color: var(--color-accent-dark);
  margin-bottom: var(--space-3);
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
