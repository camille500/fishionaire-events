<script setup>
import { vAutoAnimate } from '@formkit/auto-animate'

const { t } = useI18n()

const props = defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['loadMore'])

const displayLimit = ref(5)
const hasMore = computed(() => props.activities.length > displayLimit.value)
const visibleActivities = computed(() => props.activities.slice(0, displayLimit.value))

function showMore() {
  displayLimit.value += 5
  emit('loadMore', displayLimit.value)
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
    class="activity-feed"
  >
    <div class="activity-feed__header">
      <h3 class="activity-feed__title">
        <Icon name="lucide:activity" size="16" />
        {{ t('dashboard.activity.title') }}
      </h3>
    </div>
    <div v-if="activities.length" v-auto-animate class="activity-feed__list">
      <ActivityItem
        v-for="(activity, index) in visibleActivities"
        :key="index"
        :icon="activity.icon"
        :message="activity.message"
        :timestamp="activity.timestamp"
        :color="activity.color"
      />
    </div>
    <div v-else class="activity-feed__empty">
      <Icon name="lucide:clock" size="16" />
      <span>{{ t('dashboard.activity.empty') }}</span>
    </div>
    <button v-if="hasMore" class="activity-feed__show-more" @click="showMore">
      {{ t('dashboard.activity.showMore') }}
    </button>
  </div>
</template>

<style scoped>
.activity-feed {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
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

.activity-feed__show-more {
  display: block;
  width: 100%;
  border: none;
  background: none;
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--space-3) 0 0;
  text-align: center;
  transition: opacity var(--transition-fast);
}

.activity-feed__show-more:hover {
  opacity: 0.7;
}
</style>
