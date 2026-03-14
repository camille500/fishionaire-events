<script setup>
const { t } = useI18n()

defineProps({
  subEvent: {
    type: Object,
    required: true,
  },
  currentStatus: {
    type: String,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['rsvp'])
</script>

<template>
  <div class="rsvp-toggle">
    <div class="rsvp-toggle__info">
      <span class="rsvp-toggle__title">{{ subEvent.title }}</span>
      <span v-if="subEvent.startTime" class="rsvp-toggle__time">
        <Icon name="lucide:clock" size="12" />
        {{ new Date(subEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </span>
    </div>
    <div class="rsvp-toggle__buttons">
      <AppButton
        :variant="currentStatus === 'accepted' ? 'primary' : 'ghost'"
        size="sm"
        :disabled="loading"
        @click="emit('rsvp', { subEventId: subEvent.id, status: 'accepted' })"
      >
        <Icon name="lucide:check" size="14" />
        {{ t('dashboard.rsvp.attending') }}
      </AppButton>
      <AppButton
        :variant="currentStatus === 'declined' ? 'secondary' : 'ghost'"
        size="sm"
        :disabled="loading"
        @click="emit('rsvp', { subEventId: subEvent.id, status: 'declined' })"
      >
        <Icon name="lucide:x" size="14" />
        {{ t('dashboard.rsvp.notAttending') }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.rsvp-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.rsvp-toggle__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.rsvp-toggle__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.rsvp-toggle__time {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-toggle__buttons {
  display: flex;
  gap: var(--space-2);
}
</style>
