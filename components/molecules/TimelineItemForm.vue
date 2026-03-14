<script setup>
const { t } = useI18n()

const props = defineProps({
  item: {
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
  title: props.item?.title || '',
  description: props.item?.description || '',
  startTime: props.item?.startTime || '',
  endTime: props.item?.endTime || '',
  location: props.item?.location || '',
})

function onSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="timeline-form" @submit.prevent="onSubmit">
    <div class="timeline-form__field">
      <label class="timeline-form__label">{{ t('dashboard.eventEditor.timelineItemTitle') }}</label>
      <UInput
        v-model="form.title"
        :placeholder="t('dashboard.eventEditor.timelineItemTitlePlaceholder')"
        :disabled="loading"
        icon="i-lucide-clock"
      />
    </div>
    <div class="timeline-form__field">
      <label class="timeline-form__label">{{ t('dashboard.eventEditor.timelineItemDescription') }}</label>
      <UTextarea
        v-model="form.description"
        :placeholder="t('dashboard.eventEditor.timelineItemDescriptionPlaceholder')"
        :disabled="loading"
        :rows="2"
      />
    </div>
    <div class="timeline-form__row">
      <div class="timeline-form__field">
        <label class="timeline-form__label">{{ t('dashboard.eventEditor.timelineItemStartTime') }}</label>
        <UInput v-model="form.startTime" type="datetime-local" :disabled="loading" />
      </div>
      <div class="timeline-form__field">
        <label class="timeline-form__label">{{ t('dashboard.eventEditor.timelineItemEndTime') }}</label>
        <UInput v-model="form.endTime" type="datetime-local" :disabled="loading" />
      </div>
    </div>
    <div class="timeline-form__field">
      <label class="timeline-form__label">{{ t('dashboard.eventEditor.timelineItemLocation') }}</label>
      <UInput
        v-model="form.location"
        :placeholder="t('dashboard.eventEditor.timelineItemLocationPlaceholder')"
        :disabled="loading"
        icon="i-lucide-map-pin"
      />
    </div>
    <div class="timeline-form__actions">
      <AppButton variant="ghost" size="sm" type="button" @click="emit('cancel')">
        {{ t('dashboard.cancel') }}
      </AppButton>
      <AppButton variant="primary" size="sm" :disabled="loading || !form.title.trim() || !form.startTime">
        {{ item ? t('dashboard.eventEditor.save') : t('dashboard.eventEditor.addTimelineItem') }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.timeline-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.timeline-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.timeline-form__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.timeline-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.timeline-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}
</style>
