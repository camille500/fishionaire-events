<script setup>
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const patterns = [
  { id: '', label: 'None', icon: 'lucide:ban' },
  { id: 'dots', label: 'Dots', icon: 'lucide:grip-horizontal' },
  { id: 'crosshatch', label: 'Crosshatch', icon: 'lucide:hash' },
  { id: 'confetti', label: 'Confetti', icon: 'lucide:party-popper' },
  { id: 'botanical', label: 'Botanical', icon: 'lucide:leaf' },
  { id: 'geometric', label: 'Geometric', icon: 'lucide:hexagon' },
]

function select(id) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="pattern-picker" :class="{ 'pattern-picker--disabled': disabled }">
    <button
      v-for="pattern in patterns"
      :key="pattern.id"
      type="button"
      class="pattern-picker__option"
      :class="{ 'pattern-picker__option--active': modelValue === pattern.id }"
      :disabled="disabled"
      @click="select(pattern.id)"
    >
      <Icon :name="pattern.icon" size="18" />
      <span>{{ pattern.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.pattern-picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.pattern-picker--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.pattern-picker__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  min-width: 72px;
}

.pattern-picker__option :deep(.iconify) {
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.pattern-picker__option:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.pattern-picker__option:hover :deep(.iconify) {
  color: var(--color-accent);
}

.pattern-picker__option--active {
  border-color: var(--color-accent);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

.pattern-picker__option--active :deep(.iconify) {
  color: var(--color-accent);
}
</style>
