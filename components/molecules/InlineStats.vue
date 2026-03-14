<script setup>
defineProps({
  stats: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div v-if="stats.length" class="inline-stats">
    <span
      v-for="(stat, index) in stats"
      :key="stat.label"
      class="inline-stats__item"
    >
      <span class="inline-stats__value">{{ stat.value }}</span>
      <span class="inline-stats__label">{{ stat.label }}</span>
      <span v-if="index < stats.length - 1" class="inline-stats__sep">&middot;</span>
    </span>
  </div>
</template>

<style scoped>
.inline-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.inline-stats__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.inline-stats__value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.inline-stats__sep {
  margin: 0 var(--space-1);
  opacity: 0.4;
}
</style>
