<script setup>
const props = defineProps({
  spentCents: {
    type: Number,
    default: 0,
  },
  targetCents: {
    type: Number,
    default: null,
  },
  currency: {
    type: String,
    default: 'EUR',
  },
  status: {
    type: String,
    default: 'under',
  },
})

const percentage = computed(() => {
  if (!props.targetCents || props.targetCents <= 0) return 0
  return Math.min(Math.round((props.spentCents / props.targetCents) * 100), 100)
})

const statusColor = computed(() => {
  if (props.status === 'over') return 'var(--color-error)'
  if (props.status === 'approaching') return 'var(--color-warning)'
  return 'var(--color-success)'
})

function formatMoney(cents) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: props.currency,
  }).format(cents / 100)
}
</script>

<template>
  <div class="budget-progress">
    <div class="budget-progress__bar">
      <div
        class="budget-progress__fill"
        :style="{ width: `${percentage}%`, background: statusColor }"
      />
    </div>
    <div class="budget-progress__labels">
      <span class="budget-progress__spent" :style="{ color: statusColor }">
        {{ formatMoney(spentCents) }}
      </span>
      <span v-if="targetCents" class="budget-progress__target">
        / {{ formatMoney(targetCents) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.budget-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.budget-progress__bar {
  height: 8px;
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.budget-progress__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow), background var(--transition-fast);
}

.budget-progress__labels {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.budget-progress__spent {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
}

.budget-progress__target {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
