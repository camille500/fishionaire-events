<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
  locked: {
    type: Boolean,
    default: false,
  },
})

const analytics = ref(null)

async function fetchAnalytics() {
  try {
    analytics.value = await $fetch(`/api/events/${props.eventId}/analytics`)
  } catch {
    // May not have permission
  }
}

const maxViews = computed(() => {
  if (!analytics.value?.viewsOverTime?.length) return 1
  return Math.max(...analytics.value.viewsOverTime.map((d) => d.count), 1)
})

onMounted(() => {
  if (!props.locked) fetchAnalytics()
})
</script>

<template>
  <div class="event-analytics">
    <div class="event-analytics__header">
      <AppHeading :level="3" size="sm">{{ t('dashboard.eventEditor.analyticsSection') }}</AppHeading>
      <AppText size="sm" muted>{{ t('dashboard.eventEditor.analyticsSubtitle') }}</AppText>
    </div>

    <div v-if="locked" class="event-analytics__locked">
      <Icon name="lucide:lock" size="20" />
      <AppText size="sm" weight="semibold">{{ t('dashboard.eventEditor.analyticsLocked') }}</AppText>
      <AppText size="xs" muted>{{ t('dashboard.eventEditor.analyticsLockedDescription') }}</AppText>
    </div>

    <template v-else-if="analytics">
      <div class="event-analytics__stats">
        <AnalyticsStat :value="analytics.totalViews" :label="t('dashboard.eventEditor.totalViews')" icon="eye" />
        <AnalyticsStat :value="analytics.invitationCount" :label="t('dashboard.stats.invitations')" icon="mail" />
        <AnalyticsStat :value="analytics.rsvpBreakdown.accepted" :label="t('dashboard.accepted')" icon="check-circle" />
        <AnalyticsStat :value="analytics.acceptanceRate + '%'" :label="t('dashboard.eventEditor.acceptanceRate')" icon="trending-up" />
      </div>

      <div v-if="analytics.viewsOverTime?.length" class="event-analytics__chart">
        <AppText size="xs" weight="semibold" muted>{{ t('dashboard.eventEditor.viewsOverTime') }}</AppText>
        <div class="event-analytics__bars">
          <div
            v-for="day in analytics.viewsOverTime"
            :key="day.date"
            class="event-analytics__bar-wrapper"
            :title="`${new Date(day.date).toLocaleDateString()}: ${day.count} views`"
          >
            <div
              class="event-analytics__bar"
              :style="{ height: (day.count / maxViews * 100) + '%' }"
            />
          </div>
        </div>
      </div>

      <div class="event-analytics__rsvp">
        <AppText size="xs" weight="semibold" muted>{{ t('dashboard.eventEditor.rsvpBreakdown') }}</AppText>
        <div class="event-analytics__rsvp-bar">
          <div
            class="event-analytics__rsvp-segment event-analytics__rsvp-segment--accepted"
            :style="{ flex: analytics.rsvpBreakdown.accepted }"
          />
          <div
            class="event-analytics__rsvp-segment event-analytics__rsvp-segment--pending"
            :style="{ flex: analytics.rsvpBreakdown.pending }"
          />
          <div
            class="event-analytics__rsvp-segment event-analytics__rsvp-segment--declined"
            :style="{ flex: analytics.rsvpBreakdown.declined }"
          />
        </div>
        <div class="event-analytics__rsvp-legend">
          <span class="event-analytics__legend-item">
            <span class="event-analytics__legend-dot event-analytics__legend-dot--accepted" />
            {{ t('dashboard.accepted') }} ({{ analytics.rsvpBreakdown.accepted }})
          </span>
          <span class="event-analytics__legend-item">
            <span class="event-analytics__legend-dot event-analytics__legend-dot--pending" />
            {{ t('dashboard.pending') }} ({{ analytics.rsvpBreakdown.pending }})
          </span>
          <span class="event-analytics__legend-item">
            <span class="event-analytics__legend-dot event-analytics__legend-dot--declined" />
            {{ t('dashboard.declined') }} ({{ analytics.rsvpBreakdown.declined }})
          </span>
        </div>
      </div>
    </template>

    <div v-else class="event-analytics__empty">
      <AppText size="sm" muted>{{ t('dashboard.eventEditor.noAnalyticsData') }}</AppText>
    </div>
  </div>
</template>

<style scoped>
.event-analytics {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.event-analytics__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.event-analytics__locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
}

.event-analytics__stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-3);
}

.event-analytics__chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.event-analytics__bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 80px;
}

.event-analytics__bar-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.event-analytics__bar {
  width: 100%;
  background: var(--color-accent);
  border-radius: 2px 2px 0 0;
  min-height: 2px;
  transition: height var(--transition-base);
}

.event-analytics__rsvp {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.event-analytics__rsvp-bar {
  display: flex;
  height: 8px;
  border-radius: var(--radius-full);
  overflow: hidden;
  gap: 2px;
}

.event-analytics__rsvp-segment {
  min-width: 4px;
  transition: flex var(--transition-base);
}

.event-analytics__rsvp-segment--accepted {
  background: var(--color-success, #10b981);
}

.event-analytics__rsvp-segment--pending {
  background: var(--color-warning, #f59e0b);
}

.event-analytics__rsvp-segment--declined {
  background: var(--color-accent-dark, #ef4444);
}

.event-analytics__rsvp-legend {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.event-analytics__legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.event-analytics__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.event-analytics__legend-dot--accepted { background: var(--color-success, #10b981); }
.event-analytics__legend-dot--pending { background: var(--color-warning, #f59e0b); }
.event-analytics__legend-dot--declined { background: var(--color-accent-dark, #ef4444); }

.event-analytics__empty {
  padding: var(--space-6);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
}
</style>
