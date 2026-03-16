<script setup>
const props = defineProps({
  eventId: { type: [String, Number], required: true },
})

const emit = defineEmits(['add'])
const { t } = useI18n()

const { query, results, loading, clear } = useProductSearch(props.eventId)
const showDropdown = ref(false)

function handleAdd(product) {
  emit('add', {
    title: product.title,
    description: product.description,
    imageUrl: product.imageUrl || null,
    externalUrl: product.externalUrl || null,
    externalProductId: product.externalProductId || null,
    provider: product.provider || 'static',
    priceCents: product.priceCents || null,
    currency: product.currency || 'EUR',
    category: product.category || null,
  })
  clear()
  showDropdown.value = false
}

function formatPrice(cents) {
  if (!cents) return ''
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function onFocus() {
  showDropdown.value = true
}

function onBlur() {
  setTimeout(() => { showDropdown.value = false }, 200)
}
</script>

<template>
  <div class="search-bar">
    <div class="search-bar__input-wrap">
      <Icon name="lucide:search" class="search-bar__icon" />
      <input
        v-model="query"
        type="text"
        class="search-bar__input"
        :placeholder="t('wishlist.searchPlaceholder')"
        @focus="onFocus"
        @blur="onBlur"
      />
      <span v-if="loading" class="search-bar__spinner" />
    </div>

    <div v-if="showDropdown && results.length > 0" class="search-bar__dropdown">
      <button
        v-for="product in results"
        :key="product.externalProductId"
        class="search-bar__result"
        @mousedown="handleAdd(product)"
      >
        <div class="search-bar__result-info">
          <span class="search-bar__result-title">{{ product.title }}</span>
          <span class="search-bar__result-desc">{{ product.description }}</span>
        </div>
        <div class="search-bar__result-meta">
          <span v-if="product.priceCents" class="search-bar__result-price">{{ formatPrice(product.priceCents) }}</span>
          <Icon name="lucide:plus-circle" class="search-bar__result-add" />
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
}

.search-bar__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar__icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-tertiary);
  width: 16px;
  height: 16px;
  pointer-events: none;
}

.search-bar__input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
}

.search-bar__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.search-bar__spinner {
  position: absolute;
  right: var(--space-3);
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-bar__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: var(--space-1);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 320px;
  overflow-y: auto;
}

.search-bar__result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-family);
  transition: background var(--transition-fast);
}

.search-bar__result:last-child {
  border-bottom: none;
}

.search-bar__result:hover {
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
}

.search-bar__result-info {
  flex: 1;
  min-width: 0;
}

.search-bar__result-title {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-bar__result-desc {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-bar__result-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.search-bar__result-price {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.search-bar__result-add {
  color: var(--color-accent);
  width: 18px;
  height: 18px;
}
</style>
