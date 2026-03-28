<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  command: { type: Function, required: true },
})

const emit = defineEmits(['keyhandler'])

const selectedIndex = ref(0)

watch(() => props.items, () => {
  selectedIndex.value = 0
})

function onKeyDown(event) {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }
  if (event.key === 'Enter') {
    selectItem(selectedIndex.value)
    return true
  }
  return false
}

function selectItem(index) {
  const item = props.items[index]
  if (item) props.command(item)
}

onMounted(() => {
  emit('keyhandler', onKeyDown)
})
</script>

<template>
  <div class="mention-list">
    <div class="mention-list__header">
      <Icon name="lucide:hash" size="12" />
      <span>{{ $t('editor.mentions.title') }}</span>
    </div>
    <button
      v-for="(item, index) in items"
      :key="item.id"
      :class="['mention-list__item', { 'mention-list__item--selected': index === selectedIndex }]"
      @click="selectItem(index)"
      @mouseenter="selectedIndex = index"
    >
      <span class="mention-list__label">{{ item.label }}</span>
      <span class="mention-list__hint">{{ item.hint || '' }}</span>
    </button>
    <div v-if="!items.length" class="mention-list__empty">
      {{ $t('editor.mentions.empty') }}
    </div>
  </div>
</template>

<style scoped>
.mention-list {
  position: absolute;
  z-index: 10;
  margin-top: var(--space-1);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  overflow: hidden;
}

.mention-list__header {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-border-light);
}

.mention-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  font: inherit;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
}

.mention-list__item:hover,
.mention-list__item--selected {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.mention-list__label {
  font-weight: var(--font-weight-medium);
}

.mention-list__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.mention-list__empty {
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}
</style>
