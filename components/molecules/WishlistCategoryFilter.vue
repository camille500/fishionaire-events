<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

function toggle(cat) {
  emit('update:modelValue', cat === null ? null : cat)
}

const categoryIcons = {
  electronics: 'lucide:smartphone',
  books: 'lucide:book-open',
  home: 'lucide:home',
  kitchen: 'lucide:chef-hat',
  fashion: 'lucide:shirt',
  beauty: 'lucide:sparkles',
  experiences: 'lucide:ticket',
  toys: 'lucide:puzzle',
}
</script>

<template>
  <div class="category-filter">
    <button
      class="category-filter__pill"
      :class="{ 'category-filter__pill--active': !modelValue }"
      @click="toggle(null)"
    >
      {{ t('wishlist.allCategories') }}
    </button>
    <button
      v-for="cat in categories"
      :key="cat"
      class="category-filter__pill"
      :class="{ 'category-filter__pill--active': modelValue === cat }"
      @click="toggle(cat)"
    >
      <Icon :name="categoryIcons[cat] || 'lucide:tag'" class="category-filter__icon" />
      {{ t(`wishlist.categories.${cat}`, cat) }}
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: var(--space-1);
  scrollbar-width: none;
}

.category-filter::-webkit-scrollbar {
  display: none;
}

.category-filter__pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-filter__pill:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.category-filter__pill--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.category-filter__icon {
  width: 14px;
  height: 14px;
}

@media (max-width: 640px) {
  .category-filter__pill {
    padding: var(--space-2) var(--space-3);
    min-height: 44px;
    font-size: var(--text-sm);
  }

  .category-filter__icon {
    width: 16px;
    height: 16px;
  }
}
</style>
