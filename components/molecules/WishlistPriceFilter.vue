<script setup>
defineProps({
  modelValue: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const ranges = [
  { key: null, label: 'wishlist.allPrices' },
  { key: 'under25', label: 'wishlist.priceUnder25' },
  { key: '25to50', label: 'wishlist.price25to50' },
  { key: '50to100', label: 'wishlist.price50to100' },
  { key: 'over100', label: 'wishlist.priceOver100' },
]

function toggle(key) {
  emit('update:modelValue', key)
}
</script>

<template>
  <div class="price-filter">
    <button
      v-for="range in ranges"
      :key="range.key"
      class="price-filter__btn"
      :class="{ 'price-filter__btn--active': modelValue === range.key }"
      @click="toggle(range.key)"
    >
      {{ t(range.label) }}
    </button>
  </div>
</template>

<style scoped>
.price-filter {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.price-filter__btn {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.price-filter__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.price-filter__btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}
</style>
