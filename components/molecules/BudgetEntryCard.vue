<script setup>
const { t } = useI18n()

defineProps({
  entry: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])

function formatMoney(cents, currency = 'EUR') {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="budget-card">
    <div class="budget-card__main">
      <div class="budget-card__info">
        <span class="budget-card__description">{{ entry.description }}</span>
        <div class="budget-card__meta">
          <span class="budget-card__category">{{ t(`budget.categories.${entry.category}`, entry.category) }}</span>
          <span class="budget-card__date">{{ formatDate(entry.paidAt) }}</span>
        </div>
        <span v-if="entry.notes" class="budget-card__notes">{{ entry.notes }}</span>
      </div>
      <span class="budget-card__amount">{{ formatMoney(entry.amountCents, entry.currency) }}</span>
    </div>
    <div class="budget-card__actions">
      <button class="budget-card__action" @click="emit('edit', entry)">
        <Icon name="lucide:pencil" size="14" />
      </button>
      <button class="budget-card__action budget-card__action--danger" @click="emit('delete', entry)">
        <Icon name="lucide:trash-2" size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.budget-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-fast);
}

.budget-card:hover {
  border-color: var(--color-border);
}

.budget-card__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-width: 0;
}

.budget-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.budget-card__description {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.budget-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.budget-card__category {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
}

.budget-card__date {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.budget-card__notes {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.budget-card__amount {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.budget-card__actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.budget-card:hover .budget-card__actions {
  opacity: 1;
}

.budget-card__action {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--color-background);
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.budget-card__action:hover {
  color: var(--color-text-primary);
  background: var(--color-border-light);
}

.budget-card__action--danger:hover {
  color: var(--color-error, #e74c3c);
}
</style>
