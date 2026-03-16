<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const { results, loading, isOpen, onInput, selectResult, close } = useAddressAutocomplete()
const highlightedIndex = ref(-1)

function onInputChange(e) {
  const value = e.target.value
  emit('update:modelValue', value)
  onInput(value)
  highlightedIndex.value = -1
}

function onSelect(result) {
  emit('update:modelValue', result.displayName)
  emit('select', result)
  selectResult(result)
  highlightedIndex.value = -1
}

function onKeydown(e) {
  if (!isOpen.value || results.value.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  } else if (e.key === 'Enter' && highlightedIndex.value >= 0) {
    e.preventDefault()
    onSelect(results.value[highlightedIndex.value])
  } else if (e.key === 'Escape') {
    isOpen.value = false
    highlightedIndex.value = -1
  }
}
</script>

<template>
  <div class="address-input">
    <div class="address-input__wrapper">
      <Icon name="lucide:map-pin" size="14" class="address-input__icon" />
      <input
        type="text"
        class="address-input__field"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        @input="onInputChange"
        @keydown="onKeydown"
        @blur="close"
        @focus="() => { if (results.length > 0) isOpen = true }"
      />
      <Icon v-if="loading" name="lucide:loader-2" size="14" class="address-input__loader" />
    </div>

    <Transition name="dropdown">
      <div v-if="isOpen && results.length > 0" class="address-input__dropdown">
        <button
          v-for="(result, index) in results"
          :key="index"
          type="button"
          class="address-input__result"
          :class="{ 'address-input__result--highlighted': index === highlightedIndex }"
          @mousedown.prevent="onSelect(result)"
          @mouseover="highlightedIndex = index"
        >
          <Icon name="lucide:map-pin" size="12" class="address-input__result-icon" />
          <span class="address-input__result-text">{{ result.displayName }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.address-input {
  position: relative;
}

.address-input__wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: border-color var(--transition-fast);
}

.address-input__wrapper:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

.address-input__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
  opacity: 0.5;
}

.address-input__field {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
  min-width: 0;
}

.address-input__field::placeholder {
  color: var(--color-text-muted);
}

.address-input__field:disabled {
  opacity: 0.5;
}

.address-input__loader {
  color: var(--color-text-muted);
  flex-shrink: 0;
  animation: spin 1s linear infinite;
}

.address-input__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.1));
  max-height: 240px;
  overflow-y: auto;
}

.address-input__result {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  text-align: left;
  font-family: var(--font-family);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.address-input__result:hover,
.address-input__result--highlighted {
  background: var(--color-accent-dim);
}

.address-input__result-icon {
  color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.address-input__result-text {
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

/* Transition */
.dropdown-enter-active {
  transition: all 150ms ease-out;
}

.dropdown-leave-active {
  transition: all 100ms ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
