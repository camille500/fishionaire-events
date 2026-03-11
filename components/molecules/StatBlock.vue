<script setup>
defineProps({
  value: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="stat-block">
    <span class="stat-block__value">{{ value }}</span>
    <span class="stat-block__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-4);
}

.stat-block__value {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.stat-block__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
