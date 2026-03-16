<script setup>
const { t } = useI18n()
const { getType, getPreview } = useSubEventTypes()

const props = defineProps({
  subEvent: {
    type: Object,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete', 'click'])

const typeConfig = computed(() => getType(props.subEvent.type || 'generic'))
const preview = computed(() => getPreview(props.subEvent))

function formatTime(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div
    class="sub-event-card"
    :style="{ '--card-accent': typeConfig.color, '--card-accent-bg': typeConfig.bgColor, '--card-accent-border': typeConfig.borderColor }"
    @click="emit('click', subEvent)"
  >
    <div class="sub-event-card__drag" v-if="canEdit">
      <Icon name="lucide:grip-vertical" size="14" />
    </div>

    <SubEventTypeIcon :type="subEvent.type || 'generic'" size="sm" />

    <div class="sub-event-card__content">
      <div class="sub-event-card__header">
        <h4 class="sub-event-card__title">{{ subEvent.title }}</h4>
        <SubEventTypeBadge :type="subEvent.type || 'generic'" />
      </div>
      <p v-if="subEvent.description" class="sub-event-card__description">{{ subEvent.description }}</p>
      <div class="sub-event-card__meta">
        <span v-if="subEvent.startTime" class="sub-event-card__meta-item">
          <Icon name="lucide:clock" size="11" />
          {{ formatTime(subEvent.startTime) }}
          <template v-if="subEvent.endTime"> — {{ formatTime(subEvent.endTime) }}</template>
        </span>
        <span v-if="subEvent.location" class="sub-event-card__meta-item">
          <Icon name="lucide:map-pin" size="11" />
          {{ subEvent.location }}
        </span>
        <span v-if="preview" class="sub-event-card__meta-item sub-event-card__meta-item--accent">
          {{ preview }}
        </span>
        <CapacityIndicator
          v-if="subEvent.type === 'activity' && subEvent.capacity"
          :current="subEvent.rsvpCount || 0"
          :max="subEvent.capacity"
        />
      </div>
    </div>

    <div v-if="canEdit" class="sub-event-card__actions" @click.stop>
      <AppButton variant="ghost" size="sm" @click="emit('edit', subEvent)">
        <Icon name="lucide:pencil" size="14" />
      </AppButton>
      <AppButton variant="ghost" size="sm" @click="emit('delete', subEvent)">
        <Icon name="lucide:trash-2" size="14" />
      </AppButton>
    </div>

    <Icon v-if="!canEdit" name="lucide:chevron-right" size="14" class="sub-event-card__chevron" />
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
  cursor: pointer;
  border-left: 3px solid var(--card-accent-border);
}

.sub-event-card:hover {
  border-color: var(--card-accent-border);
  border-left-color: var(--card-accent);
  background: var(--card-accent-bg);
}

.sub-event-card__drag {
  color: var(--color-text-muted);
  cursor: grab;
  flex-shrink: 0;
}

.sub-event-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sub-event-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.sub-event-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.sub-event-card__description {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sub-event-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.sub-event-card__meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.sub-event-card__meta-item--accent {
  color: var(--card-accent);
  font-weight: var(--font-weight-medium);
}

.sub-event-card__actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.sub-event-card__chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.sub-event-card:hover .sub-event-card__chevron {
  opacity: 0.8;
}
</style>
