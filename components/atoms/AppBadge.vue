<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'accent', 'success', 'warning', 'error'].includes(v),
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
  padding: 2px var(--space-2);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-full);
  line-height: 1.5;
  white-space: nowrap;
}

.app-badge--default {
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  color: var(--color-text-secondary);
}

.app-badge--accent {
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

.app-badge--success {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}

.app-badge--warning {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.app-badge--error {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}
</style>
