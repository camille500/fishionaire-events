<script setup>
defineProps({
  cents: {
    type: Number,
    default: null,
  },
  currency: {
    type: String,
    default: 'EUR',
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
})

function formatPrice(cents, currency) {
  if (!cents && cents !== 0) return null
  const amount = cents / 100
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency || 'EUR',
  }).format(amount)
}
</script>

<template>
  <span v-if="cents != null" class="price-tag" :class="`price-tag--${size}`">
    {{ formatPrice(cents, currency) }}
  </span>
</template>

<style scoped>
.price-tag {
  font-family: var(--font-family);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.price-tag--sm {
  font-size: var(--text-xs);
}

.price-tag--md {
  font-size: var(--text-sm);
}

.price-tag--lg {
  font-size: var(--text-base);
}
</style>
