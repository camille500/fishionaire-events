<script setup>
const { t } = useI18n()

const props = defineProps({
  subEvent: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  title: props.subEvent?.title || '',
  description: props.subEvent?.description || '',
  startTime: props.subEvent?.startTime || '',
  endTime: props.subEvent?.endTime || '',
  location: props.subEvent?.location || '',
})

function onSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="sub-event-form" @submit.prevent="onSubmit">
    <div class="sub-event-form__field">
      <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventTitle') }}</label>
      <UInput
        v-model="form.title"
        :placeholder="t('dashboard.eventEditor.subEventTitlePlaceholder')"
        :disabled="loading"
        icon="i-lucide-tag"
      />
    </div>
    <div class="sub-event-form__field">
      <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventDescription') }}</label>
      <UTextarea
        v-model="form.description"
        :placeholder="t('dashboard.eventEditor.subEventDescriptionPlaceholder')"
        :disabled="loading"
        :rows="2"
      />
    </div>
    <div class="sub-event-form__row">
      <div class="sub-event-form__field">
        <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventStartTime') }}</label>
        <UInput v-model="form.startTime" type="datetime-local" :disabled="loading" />
      </div>
      <div class="sub-event-form__field">
        <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventEndTime') }}</label>
        <UInput v-model="form.endTime" type="datetime-local" :disabled="loading" />
      </div>
    </div>
    <div class="sub-event-form__field">
      <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventLocation') }}</label>
      <UInput
        v-model="form.location"
        :placeholder="t('dashboard.eventEditor.subEventLocationPlaceholder')"
        :disabled="loading"
        icon="i-lucide-map-pin"
      />
    </div>
    <div class="sub-event-form__actions">
      <AppButton variant="ghost" size="sm" type="button" @click="emit('cancel')">
        {{ t('dashboard.cancel') }}
      </AppButton>
      <AppButton variant="primary" size="sm" :disabled="loading || !form.title.trim()">
        {{ subEvent ? t('dashboard.eventEditor.save') : t('dashboard.eventEditor.addSubEvent') }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.sub-event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.sub-event-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sub-event-form__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.sub-event-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.sub-event-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}
</style>
