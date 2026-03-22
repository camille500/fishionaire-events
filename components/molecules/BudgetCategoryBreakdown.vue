<script setup>
const { t } = useI18n()

defineProps({
  breakdown: {
    type: Array,
    default: () => [],
  },
  currency: {
    type: String,
    default: 'EUR',
  },
  totalSpentCents: {
    type: Number,
    default: 0,
  },
})

const categoryColors = {
  venue: 'var(--color-event-corporate)',
  catering: 'var(--color-event-dinner)',
  decoration: 'var(--color-event-wedding)',
  entertainment: 'var(--color-event-birthday)',
  photography: 'var(--color-accent)',
  attire: 'var(--color-event-baby-shower, #a29bfe)',
  transport: 'var(--color-info, #61aeee)',
  other: 'var(--color-text-muted)',
}

function getColor(category) {
  return categoryColors[category] || 'var(--color-text-muted)'
}

function formatMoney(cents, currency) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}
</script>

<template>
  <div v-if="breakdown.length > 0" class="category-breakdown">
    <span class="category-breakdown__title">{{ t('budget.categoryBreakdown') }}</span>
    <div class="category-breakdown__list">
      <div
        v-for="item in breakdown"
        :key="item.category"
        class="category-breakdown__item"
      >
        <div class="category-breakdown__header">
          <span class="category-breakdown__name">{{ t(`budget.categories.${item.category}`, item.category) }}</span>
          <span class="category-breakdown__amount">{{ formatMoney(item.totalCents, currency) }}</span>
        </div>
        <div class="category-breakdown__bar-bg">
          <div
            class="category-breakdown__bar-fill"
            :style="{
              width: `${totalSpentCents > 0 ? Math.round((item.totalCents / totalSpentCents) * 100) : 0}%`,
              background: getColor(item.category),
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.category-breakdown__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.category-breakdown__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.category-breakdown__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.category-breakdown__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-breakdown__name {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.category-breakdown__amount {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.category-breakdown__bar-bg {
  height: 6px;
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.category-breakdown__bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
  min-width: 4px;
}
</style>
