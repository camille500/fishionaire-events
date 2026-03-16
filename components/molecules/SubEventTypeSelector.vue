<script setup>
const { types, getLabel, getDescription } = useSubEventTypes()

const props = defineProps({
  modelValue: {
    type: String,
    default: 'generic',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

function selectType(key) {
  if (!props.disabled) {
    emit('update:modelValue', key)
  }
}
</script>

<template>
  <div class="type-selector">
    <button
      v-for="type in types"
      :key="type.key"
      type="button"
      class="type-selector__option"
      :class="{
        'type-selector__option--selected': modelValue === type.key,
        'type-selector__option--disabled': disabled,
      }"
      :style="{
        '--type-color': type.color,
        '--type-bg': type.bgColor,
        '--type-border': type.borderColor,
      }"
      @click="selectType(type.key)"
    >
      <SubEventTypeIcon :type="type.key" size="sm" />
      <div class="type-selector__text">
        <span class="type-selector__label">{{ getLabel(type.key) }}</span>
        <span class="type-selector__desc">{{ getDescription(type.key) }}</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-2);
}

.type-selector__option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1.5px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  font-family: var(--font-family);
}

.type-selector__option:hover:not(.type-selector__option--disabled) {
  border-color: var(--type-border);
  background: var(--type-bg);
}

.type-selector__option--selected {
  border-color: var(--type-color) !important;
  background: var(--type-bg) !important;
  box-shadow: 0 0 0 1px var(--type-border);
}

.type-selector__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-selector__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.type-selector__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.type-selector__desc {
  font-size: 10px;
  color: var(--color-text-muted);
  line-height: 1.3;
}
</style>
