<script setup>
const { t } = useI18n()

const { data: analytics, status } = useFetch('/api/dashboard/analytics', { lazy: true })

const hasData = computed(() => analytics.value && (analytics.value.totalViews > 0 || analytics.value.totalInvitations > 0))
</script>

<template>
  <div v-if="status !== 'error'" class="dashboard-analytics">
    <div class="dashboard-analytics__header">
      <h3 class="dashboard-analytics__title">
        <Icon name="lucide:bar-chart-3" size="16" />
        {{ t('dashboard.analytics.title') }}
        <InfoIcon :content="t('infoIcon.analytics')" position="right" />
      </h3>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="dashboard-analytics__loading">
      <Icon name="lucide:loader-2" size="16" class="dashboard-analytics__spinner" />
    </div>

    <!-- Empty -->
    <div v-else-if="!hasData" class="dashboard-analytics__empty">
      <Icon name="lucide:bar-chart-3" size="16" />
      <span>{{ t('dashboard.analytics.empty') }}</span>
    </div>

    <!-- Stats -->
    <template v-else>
      <div class="dashboard-analytics__grid">
        <!-- RSVP Rate -->
        <div class="dashboard-analytics__stat">
          <ProgressRing :percentage="analytics.rsvpRate" :size="52" :stroke-width="5" color="var(--color-success)" />
          <div class="dashboard-analytics__stat-info">
            <span class="dashboard-analytics__stat-label">{{ t('dashboard.analytics.rsvpRate') }}</span>
            <span class="dashboard-analytics__stat-detail">
              {{ analytics.rsvpBreakdown.accepted }}/{{ analytics.totalInvitations }} {{ t('dashboard.analytics.accepted') }}
            </span>
          </div>
        </div>

        <!-- Total Views -->
        <div class="dashboard-analytics__stat">
          <div class="dashboard-analytics__stat-icon">
            <Icon name="lucide:eye" size="18" />
          </div>
          <div class="dashboard-analytics__stat-info">
            <span class="dashboard-analytics__stat-value">{{ analytics.totalViews }}</span>
            <span class="dashboard-analytics__stat-label">{{ t('dashboard.analytics.views') }}</span>
          </div>
        </div>

        <!-- Wishlist Claim Rate -->
        <div v-if="analytics.wishlistClaimRate > 0" class="dashboard-analytics__stat">
          <ProgressRing :percentage="analytics.wishlistClaimRate" :size="52" :stroke-width="5" color="var(--color-accent)" />
          <div class="dashboard-analytics__stat-info">
            <span class="dashboard-analytics__stat-label">{{ t('dashboard.analytics.wishlistClaimed') }}</span>
          </div>
        </div>

        <!-- Budget Utilization -->
        <div v-if="analytics.budgetUtilization !== null" class="dashboard-analytics__stat">
          <ProgressRing
            :percentage="Math.min(analytics.budgetUtilization, 100)"
            :size="52"
            :stroke-width="5"
            :color="analytics.budgetUtilization > 100 ? 'var(--color-error)' : 'var(--color-accent-violet)'"
          />
          <div class="dashboard-analytics__stat-info">
            <span class="dashboard-analytics__stat-label">{{ t('dashboard.analytics.budgetSpent') }}</span>
          </div>
        </div>
      </div>

      <!-- RSVP breakdown bar -->
      <div class="dashboard-analytics__rsvp-bar">
        <div
          class="dashboard-analytics__rsvp-segment dashboard-analytics__rsvp-segment--accepted"
          :style="{ flex: analytics.rsvpBreakdown.accepted }"
        />
        <div
          class="dashboard-analytics__rsvp-segment dashboard-analytics__rsvp-segment--pending"
          :style="{ flex: analytics.rsvpBreakdown.pending }"
        />
        <div
          class="dashboard-analytics__rsvp-segment dashboard-analytics__rsvp-segment--declined"
          :style="{ flex: analytics.rsvpBreakdown.declined }"
        />
      </div>
      <div class="dashboard-analytics__rsvp-legend">
        <span class="dashboard-analytics__legend-item">
          <span class="dashboard-analytics__legend-dot dashboard-analytics__legend-dot--accepted" />
          {{ analytics.rsvpBreakdown.accepted }} {{ t('dashboard.analytics.accepted') }}
        </span>
        <span class="dashboard-analytics__legend-item">
          <span class="dashboard-analytics__legend-dot dashboard-analytics__legend-dot--pending" />
          {{ analytics.rsvpBreakdown.pending }} {{ t('dashboard.analytics.pending') }}
        </span>
        <span class="dashboard-analytics__legend-item">
          <span class="dashboard-analytics__legend-dot dashboard-analytics__legend-dot--declined" />
          {{ analytics.rsvpBreakdown.declined }} {{ t('dashboard.analytics.declined') }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-analytics {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.dashboard-analytics__header {
  margin-bottom: var(--space-4);
}

.dashboard-analytics__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.dashboard-analytics__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-6);
}

.dashboard-analytics__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dashboard-analytics__empty {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) 0;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.dashboard-analytics__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.dashboard-analytics__stat {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-accent) 3%, transparent);
  border-radius: var(--radius-lg);
}

.dashboard-analytics__stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  flex-shrink: 0;
}

.dashboard-analytics__stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dashboard-analytics__stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.dashboard-analytics__stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.dashboard-analytics__stat-detail {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* RSVP bar */
.dashboard-analytics__rsvp-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--color-border-light);
  gap: 2px;
}

.dashboard-analytics__rsvp-segment {
  border-radius: 3px;
  transition: flex 0.4s ease;
}

.dashboard-analytics__rsvp-segment--accepted { background: var(--color-success); }
.dashboard-analytics__rsvp-segment--pending { background: var(--color-warning, #f59e0b); }
.dashboard-analytics__rsvp-segment--declined { background: var(--color-error); }

.dashboard-analytics__rsvp-legend {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-2);
  flex-wrap: wrap;
}

.dashboard-analytics__legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.dashboard-analytics__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.dashboard-analytics__legend-dot--accepted { background: var(--color-success); }
.dashboard-analytics__legend-dot--pending { background: var(--color-warning, #f59e0b); }
.dashboard-analytics__legend-dot--declined { background: var(--color-error); }
</style>
