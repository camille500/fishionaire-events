<script setup>
const { t } = useI18n()

defineProps({
  stats: {
    type: Object,
    required: true,
  },
  spentPercentage: {
    type: Number,
    default: 0,
  },
  budgetStatus: {
    type: String,
    default: 'under',
  },
})

function formatMoney(cents, currency = 'EUR') {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}
</script>

<template>
  <div class="budget-stats">
    <BudgetProgressBar
      :spent-cents="stats.totalSpentCents"
      :target-cents="stats.budgetTargetCents"
      :currency="stats.budgetCurrency"
      :status="budgetStatus"
    />

    <div class="budget-stats__grid">
      <div class="budget-stats__item">
        <Icon name="lucide:wallet" size="16" class="budget-stats__icon" />
        <span class="budget-stats__label">{{ t('budget.budgetTarget') }}</span>
        <span class="budget-stats__value">
          {{ stats.budgetTargetCents ? formatMoney(stats.budgetTargetCents, stats.budgetCurrency) : t('budget.noBudgetSet') }}
        </span>
      </div>
      <div class="budget-stats__item">
        <Icon name="lucide:receipt" size="16" class="budget-stats__icon" />
        <span class="budget-stats__label">{{ t('budget.totalSpent') }}</span>
        <span class="budget-stats__value">{{ formatMoney(stats.totalSpentCents, stats.budgetCurrency) }}</span>
      </div>
      <div v-if="stats.budgetTargetCents" class="budget-stats__item">
        <Icon name="lucide:piggy-bank" size="16" class="budget-stats__icon" />
        <span class="budget-stats__label">{{ stats.remainingCents >= 0 ? t('budget.remaining') : t('budget.overBudget') }}</span>
        <span
          class="budget-stats__value"
          :style="{ color: stats.remainingCents < 0 ? 'var(--color-error)' : undefined }"
        >
          {{ formatMoney(Math.abs(stats.remainingCents), stats.budgetCurrency) }}
        </span>
      </div>
      <div class="budget-stats__item">
        <Icon name="lucide:list" size="16" class="budget-stats__icon" />
        <span class="budget-stats__label">{{ t('budget.stats.entries') }}</span>
        <span class="budget-stats__value">{{ stats.entryCount }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.budget-stats__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
}

.budget-stats__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.budget-stats__icon {
  color: var(--color-text-muted);
  margin-bottom: var(--space-1);
}

.budget-stats__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.budget-stats__value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
</style>
