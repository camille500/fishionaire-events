<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'accent', 'success'].includes(v),
  },
})
</script>

<template>
  <span class="app-badge" :class="`app-badge--${variant}`">
    {{ label }}
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.app-badge--default {
  background: var(--color-background-alt);
  color: var(--color-text-secondary);
}

.app-badge--accent {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.app-badge--success {
  background: var(--color-success);
  color: var(--color-text-inverse);
}
</style>
