<script setup>
const props = defineProps({
  current: {
    type: Number,
    default: 0,
  },
  target: {
    type: Number,
    default: 0,
  },
})

const percentage = computed(() => {
  if (!props.target || props.target <= 0) return 0
  return Math.min(100, Math.round((props.current / props.target) * 100))
})

function formatEur(cents) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
</script>

<template>
  <div class="pool-progress">
    <div class="pool-progress__bar">
      <div
        class="pool-progress__fill"
        :style="{ width: `${percentage}%` }"
        :class="{ 'pool-progress__fill--complete': percentage >= 100 }"
      />
    </div>
    <div class="pool-progress__label">
      {{ formatEur(current) }} / {{ formatEur(target) }}
      <span class="pool-progress__pct">({{ percentage }}%)</span>
    </div>
  </div>
</template>

<style scoped>
.pool-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.pool-progress__bar {
  width: 100%;
  height: 6px;
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.pool-progress__fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.pool-progress__fill--complete {
  background: var(--color-success);
}

.pool-progress__label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.pool-progress__pct {
  opacity: 0.7;
}
</style>
