<script setup>
defineProps({
  spacing: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
})
</script>

<template>
  <hr class="app-divider" :class="`app-divider--${spacing}`" />
</template>

<style scoped>
.app-divider {
  border: none;
  height: 1px;
  background: var(--color-border-light);
}

.app-divider--sm { margin: var(--space-4) 0; }
.app-divider--md { margin: var(--space-8) 0; }
.app-divider--lg { margin: var(--space-12) 0; }
</style>
