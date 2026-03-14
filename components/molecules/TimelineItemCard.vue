<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete'])

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="timeline-item-card">
    <div v-if="editable" class="timeline-item-card__drag">
      <Icon name="lucide:grip-vertical" size="14" />
    </div>
    <div class="timeline-item-card__marker">
      <div class="timeline-item-card__dot" />
      <div class="timeline-item-card__line" />
    </div>
    <div class="timeline-item-card__content">
      <div class="timeline-item-card__time">{{ formatTime(item.startTime) }}</div>
      <h4 class="timeline-item-card__title">{{ item.title }}</h4>
      <p v-if="item.description" class="timeline-item-card__description">{{ item.description }}</p>
      <div v-if="item.location" class="timeline-item-card__location">
        <Icon name="lucide:map-pin" size="12" />
        {{ item.location }}
      </div>
    </div>
    <div v-if="editable" class="timeline-item-card__actions">
      <AppButton variant="ghost" size="sm" @click="emit('edit', item)">
        <Icon name="lucide:pencil" size="14" />
      </AppButton>
      <AppButton variant="ghost" size="sm" @click="emit('delete', item)">
        <Icon name="lucide:trash-2" size="14" />
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.timeline-item-card {
  display: flex;
  gap: var(--space-3);
  position: relative;
}

.timeline-item-card__drag {
  color: var(--color-text-muted);
  cursor: grab;
  flex-shrink: 0;
  padding-top: var(--space-1);
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.timeline-item-card:hover .timeline-item-card__drag {
  opacity: 1;
}

.timeline-item-card__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: var(--space-1);
}

.timeline-item-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
}

.timeline-item-card__line {
  width: 2px;
  flex: 1;
  background: var(--color-border-light);
  min-height: var(--space-4);
}

.timeline-item-card__content {
  flex: 1;
  min-width: 0;
  padding-bottom: var(--space-4);
}

.timeline-item-card__time {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

.timeline-item-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.timeline-item-card__description {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0;
}

.timeline-item-card__location {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.timeline-item-card__actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}
</style>
