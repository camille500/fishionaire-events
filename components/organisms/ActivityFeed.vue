<script setup>
const { t } = useI18n()

defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 16 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
    class="activity-feed"
  >
    <div class="activity-feed__header">
      <h3 class="activity-feed__title">
        <AppIcon name="activity" size="sm" />
        {{ t('dashboard.activity.title') }}
      </h3>
    </div>
    <div v-if="activities.length" class="activity-feed__list">
      <ActivityItem
        v-for="(activity, index) in activities.slice(0, 5)"
        :key="index"
        :icon="activity.icon"
        :message="activity.message"
        :timestamp="activity.timestamp"
        :color="activity.color"
      />
    </div>
    <div v-else class="activity-feed__empty">
      <AppIcon name="clock" size="sm" />
      <span>{{ t('dashboard.activity.empty') }}</span>
    </div>
  </div>
</template>

<style scoped>
.activity-feed {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.activity-feed__header {
  margin-bottom: var(--space-4);
}

.activity-feed__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.activity-feed__list {
  display: flex;
  flex-direction: column;
}

.activity-feed__empty {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) 0;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
