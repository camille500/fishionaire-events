<script setup>
const { t, locale } = useI18n()

defineProps({
  events: {
    type: Array,
    default: () => [],
  },
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value, {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 16 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
    class="timeline"
  >
    <div class="timeline__header">
      <h3 class="timeline__title">
        <Icon name="lucide:clock" size="16" />
        {{ t('dashboard.timeline.title') }}
      </h3>
    </div>

    <div v-if="events.length" class="timeline__list">
      <div
        v-for="(event, index) in events.slice(0, 5)"
        :key="event.id || index"
        class="timeline__item"
      >
        <div class="timeline__marker">
          <div class="timeline__dot" />
          <div v-if="index < Math.min(events.length, 5) - 1" class="timeline__line" />
        </div>
        <div class="timeline__content">
          <span class="timeline__date">{{ formatDate(event.date) || t('dashboard.timeline.noDate') }}</span>
          <span class="timeline__event-title">{{ event.title }}</span>
          <span v-if="event.invitationCount" class="timeline__guests">
            <Icon name="lucide:users" size="16" />
            {{ event.invitationCount }} {{ t('dashboard.timeline.guests') }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="timeline__empty">
      <Icon name="lucide:calendar" size="16" />
      <span>{{ t('dashboard.timeline.empty') }}</span>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.timeline__header {
  margin-bottom: var(--space-4);
}

.timeline__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.timeline__list {
  display: flex;
  flex-direction: column;
}

.timeline__item {
  display: flex;
  gap: var(--space-4);
}

.timeline__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}

.timeline__dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline__line {
  width: 2px;
  flex: 1;
  background: var(--color-border);
  margin: var(--space-1) 0;
}

.timeline__content {
  flex: 1;
  padding-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline__date {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timeline__event-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.timeline__guests {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.timeline__empty {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) 0;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
