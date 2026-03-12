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
  padding: var(--space-4) var(--space-6);
  position: relative;
}

.stat-block__value {
  font-family: var(--font-family-heading);
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-extrabold);
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: var(--line-height-tight);
}

.stat-block__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}
</style>
