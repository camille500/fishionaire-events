<script setup>
definePageMeta({ layout: 'admin' })

const { t } = useI18n()

const { data: stats } = await useFetch('/api/admin/stats')
const { data: analytics } = await useFetch('/api/admin/analytics', { query: { days: 30 } })

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { icon: 'users', label: t('admin.stats.totalUsers'), value: stats.value.users, color: 'var(--color-accent)' },
    { icon: 'calendar', label: t('admin.stats.totalEvents'), value: stats.value.events, color: 'var(--color-info)' },
    { icon: 'credit-card', label: t('admin.stats.paidSubscriptions'), value: (stats.value.subscriptions?.standard || 0) + (stats.value.subscriptions?.pro || 0), color: 'var(--color-warning)' },
    { icon: 'euro', label: t('admin.stats.revenue'), value: formatCurrency(stats.value.revenue?.totalCents || 0), color: 'var(--color-success)' },
  ]
})

// Doughnut chart data
const tierLabels = ['Free', 'Standard', 'Pro']
const tierData = computed(() => {
  if (!stats.value?.subscriptions) return [0, 0, 0]
  return [
    stats.value.subscriptions.free || 0,
    stats.value.subscriptions.standard || 0,
    stats.value.subscriptions.pro || 0,
  ]
})
const tierColors = ['#787890', '#ff9f43', '#00b894']

// Line chart helpers
function buildDateLabels(data) {
  if (!data?.length) return []
  return data.map((d) => {
    const date = new Date(d.date)
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  })
}

function mergeDateSeries(series1, series2) {
  const allDates = new Set([
    ...(series1 || []).map((d) => d.date),
    ...(series2 || []).map((d) => d.date),
  ])
  const sorted = [...allDates].sort()
  const map1 = Object.fromEntries((series1 || []).map((d) => [d.date, d.count]))
  const map2 = Object.fromEntries((series2 || []).map((d) => [d.date, d.count]))

  return {
    labels: sorted.map((d) => {
      const date = new Date(d)
      return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    }),
    data1: sorted.map((d) => map1[d] || 0),
    data2: sorted.map((d) => map2[d] || 0),
  }
}

const growthChart = computed(() => {
  if (!analytics.value) return { labels: [], data1: [], data2: [] }
  return mergeDateSeries(analytics.value.userGrowth, analytics.value.eventGrowth)
})

const growthDatasets = computed(() => [
  { label: t('admin.analytics.users'), data: growthChart.value.data1, color: '#00b894' },
  { label: t('admin.analytics.events'), data: growthChart.value.data2, color: '#61aeee' },
])

const revenueLabels = computed(() => buildDateLabels(analytics.value?.revenueOverTime))
const revenueDatasets = computed(() => [{
  label: t('admin.analytics.revenueTrend'),
  data: (analytics.value?.revenueOverTime || []).map((d) => d.totalCents / 100),
  color: '#00b894',
}])

const viewsLabels = computed(() => buildDateLabels(analytics.value?.viewsOverTime))
const viewsDatasets = computed(() => [{
  label: t('admin.analytics.pageViews'),
  data: (analytics.value?.viewsOverTime || []).map((d) => d.count),
  color: '#61aeee',
}])

function formatCurrency(cents) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function formatEur(value) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <div class="admin-overview">
    <AppHeading :level="1">{{ t('admin.overview.title') }}</AppHeading>
    <AppText color="muted">{{ t('admin.overview.subtitle') }}</AppText>

    <!-- Stat cards -->
    <div class="admin-overview__stats">
      <StatCard
        v-for="card in statCards"
        :key="card.label"
        :icon="card.icon"
        :label="card.label"
        :value="card.value"
        :color="card.color"
      />
    </div>

    <!-- Charts row 1: Growth + Subscription distribution -->
    <div class="admin-overview__charts-row">
      <div class="admin-overview__chart-card">
        <AppHeading :level="3">{{ t('admin.analytics.userEventGrowth') }}</AppHeading>
        <ClientOnly>
          <ChartLine
            v-if="growthChart.labels.length"
            :labels="growthChart.labels"
            :datasets="growthDatasets"
          />
          <div v-else class="admin-overview__chart-empty">
            <AppText size="sm" color="muted">No data yet</AppText>
          </div>
        </ClientOnly>
      </div>
      <div class="admin-overview__chart-card admin-overview__chart-card--narrow">
        <AppHeading :level="3">{{ t('admin.analytics.subscriptionDistribution') }}</AppHeading>
        <ClientOnly>
          <ChartDoughnut
            v-if="tierData.some((v) => v > 0)"
            :labels="tierLabels"
            :data="tierData"
            :colors="tierColors"
          />
          <div v-else class="admin-overview__chart-empty">
            <AppText size="sm" color="muted">No data yet</AppText>
          </div>
        </ClientOnly>
      </div>
    </div>

    <!-- Charts row 2: Revenue + Page views -->
    <div class="admin-overview__charts-row">
      <div class="admin-overview__chart-card">
        <AppHeading :level="3">{{ t('admin.analytics.revenueTrend') }}</AppHeading>
        <ClientOnly>
          <ChartLine
            v-if="revenueLabels.length"
            :labels="revenueLabels"
            :datasets="revenueDatasets"
            :y-format="formatEur"
          />
          <div v-else class="admin-overview__chart-empty">
            <AppText size="sm" color="muted">No data yet</AppText>
          </div>
        </ClientOnly>
      </div>
      <div class="admin-overview__chart-card">
        <AppHeading :level="3">{{ t('admin.analytics.pageViews') }}</AppHeading>
        <ClientOnly>
          <ChartLine
            v-if="viewsLabels.length"
            :labels="viewsLabels"
            :datasets="viewsDatasets"
          />
          <div v-else class="admin-overview__chart-empty">
            <AppText size="sm" color="muted">No data yet</AppText>
          </div>
        </ClientOnly>
      </div>
    </div>

    <!-- Quick links -->
    <div class="admin-overview__quick-links">
      <AppHeading :level="3">{{ t('admin.overview.quickLinks') }}</AppHeading>
      <div class="quick-links-grid">
        <NuxtLink to="/admin/users" class="quick-link">
          <Icon name="lucide:users" size="20" />
          <span>{{ t('admin.sidebar.users') }}</span>
          <Icon name="lucide:arrow-right" size="16" class="quick-link__arrow" />
        </NuxtLink>
        <NuxtLink to="/admin/subscriptions" class="quick-link">
          <Icon name="lucide:credit-card" size="20" />
          <span>{{ t('admin.sidebar.subscriptions') }}</span>
          <Icon name="lucide:arrow-right" size="16" class="quick-link__arrow" />
        </NuxtLink>
        <NuxtLink to="/admin/events" class="quick-link">
          <Icon name="lucide:calendar" size="20" />
          <span>{{ t('admin.sidebar.events') }}</span>
          <Icon name="lucide:arrow-right" size="16" class="quick-link__arrow" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-overview {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.admin-overview__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.admin-overview__charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.admin-overview__chart-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.admin-overview__chart-card--narrow {
  max-width: 100%;
}

.admin-overview__chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.quick-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.quick-link:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.quick-link__arrow {
  margin-left: auto;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.quick-link:hover .quick-link__arrow {
  transform: translateX(2px);
  color: var(--color-accent);
}

@media (max-width: 1024px) {
  .admin-overview__stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-overview__charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-overview__stats {
    grid-template-columns: 1fr;
  }

  .quick-links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
