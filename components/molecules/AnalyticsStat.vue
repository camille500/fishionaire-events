<script setup>
defineProps({
  value: {
    type: [Number, String],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'bar-chart-3',
  },
})
</script>

<template>
  <div class="analytics-stat">
    <div class="analytics-stat__icon">
      <Icon :name="'lucide:' + icon" size="16" />
    </div>
    <div class="analytics-stat__content">
      <span class="analytics-stat__value">{{ value }}</span>
      <span class="analytics-stat__label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.analytics-stat {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.analytics-stat__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  flex-shrink: 0;
}

.analytics-stat__content {
  display: flex;
  flex-direction: column;
}

.analytics-stat__value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.analytics-stat__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}
</style>
