<script setup>
const { t } = useI18n()

defineProps({
  subEvent: {
    type: Object,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete'])

function formatTime(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="sub-event-card">
    <div class="sub-event-card__drag" v-if="canEdit">
      <Icon name="lucide:grip-vertical" size="14" />
    </div>
    <div class="sub-event-card__content">
      <div class="sub-event-card__header">
        <h4 class="sub-event-card__title">{{ subEvent.title }}</h4>
        <div v-if="subEvent.startTime" class="sub-event-card__time">
          <Icon name="lucide:clock" size="12" />
          {{ formatTime(subEvent.startTime) }}
          <template v-if="subEvent.endTime"> — {{ formatTime(subEvent.endTime) }}</template>
        </div>
      </div>
      <p v-if="subEvent.description" class="sub-event-card__description">{{ subEvent.description }}</p>
      <div v-if="subEvent.location" class="sub-event-card__location">
        <Icon name="lucide:map-pin" size="12" />
        {{ subEvent.location }}
      </div>
    </div>
    <div v-if="canEdit" class="sub-event-card__actions">
      <AppButton variant="ghost" size="sm" @click="emit('edit', subEvent)">
        <Icon name="lucide:pencil" size="14" />
      </AppButton>
      <AppButton variant="ghost" size="sm" @click="emit('delete', subEvent)">
        <Icon name="lucide:trash-2" size="14" />
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.sub-event-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: all var(--transition-base);
}

.sub-event-card:hover {
  border-color: var(--color-border);
}

.sub-event-card__drag {
  color: var(--color-text-muted);
  cursor: grab;
  flex-shrink: 0;
}

.sub-event-card__content {
  flex: 1;
  min-width: 0;
}

.sub-event-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.sub-event-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.sub-event-card__time {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.sub-event-card__description {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0;
}

.sub-event-card__location {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.sub-event-card__actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}
</style>
