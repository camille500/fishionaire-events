<script setup>
defineProps({
  count: {
    type: Number,
    default: 0,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'accent', 'warning'].includes(v),
  },
})
</script>

<template>
  <span
    v-if="count > 0"
    :class="['count-badge', `count-badge--${variant}`]"
  >
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<style scoped>
.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  animation: pulse-soft 2s ease-in-out infinite;
}

.count-badge--default {
  background: var(--color-text-muted);
  color: white;
}

.count-badge--accent {
  background: var(--color-accent);
  color: white;
}

.count-badge--warning {
  background: var(--color-warning);
  color: white;
}
</style>
