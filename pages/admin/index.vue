<script setup>
definePageMeta({ layout: 'admin' })

const { t } = useI18n()

const { data: stats, pending } = await useFetch('/api/admin/stats')

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { icon: 'users', label: t('admin.stats.totalUsers'), value: stats.value.users, color: 'var(--color-accent)' },
    { icon: 'calendar', label: t('admin.stats.totalEvents'), value: stats.value.events, color: 'var(--color-info)' },
    { icon: 'credit-card', label: t('admin.stats.paidSubscriptions'), value: (stats.value.subscriptions?.standard || 0) + (stats.value.subscriptions?.pro || 0), color: 'var(--color-warning)' },
    { icon: 'euro', label: t('admin.stats.revenue'), value: formatCurrency(stats.value.revenue?.totalCents || 0), color: 'var(--color-success)' },
  ]
})

const tierBreakdown = computed(() => {
  if (!stats.value?.subscriptions) return []
  return [
    { label: 'Free', count: stats.value.subscriptions.free || 0, color: 'var(--color-text-muted)' },
    { label: 'Standard', count: stats.value.subscriptions.standard || 0, color: 'var(--color-warning)' },
    { label: 'Pro', count: stats.value.subscriptions.pro || 0, color: 'var(--color-accent)' },
  ]
})

function formatCurrency(cents) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
</script>

<template>
  <div class="admin-overview">
    <AppHeading :level="1">{{ t('admin.overview.title') }}</AppHeading>
    <AppText color="muted">{{ t('admin.overview.subtitle') }}</AppText>

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

    <div class="admin-overview__section">
      <AppHeading :level="3">{{ t('admin.overview.subscriptionBreakdown') }}</AppHeading>
      <div class="tier-breakdown">
        <div v-for="tier in tierBreakdown" :key="tier.label" class="tier-breakdown__item">
          <div class="tier-breakdown__bar">
            <div
              class="tier-breakdown__fill"
              :style="{
                width: stats?.users ? Math.max((tier.count / stats.users) * 100, 2) + '%' : '2%',
                background: tier.color,
              }"
            />
          </div>
          <div class="tier-breakdown__info">
            <AppText size="sm" weight="semibold">{{ tier.label }}</AppText>
            <AppText size="sm" color="muted">{{ tier.count }}</AppText>
          </div>
        </div>
      </div>
    </div>

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

.admin-overview__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tier-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.tier-breakdown__item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.tier-breakdown__bar {
  flex: 1;
  height: 8px;
  background: var(--color-background);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.tier-breakdown__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.tier-breakdown__info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 120px;
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
