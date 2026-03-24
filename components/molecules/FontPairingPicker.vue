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

const pairings = [
  { id: '', heading: 'Plus Jakarta Sans', body: 'Inter', label: 'Default', style: 'Modern' },
  { id: 'playfair-inter', heading: 'Playfair Display', body: 'Inter', label: 'Elegant', style: 'Serif' },
  { id: 'poppins-dmsans', heading: 'Poppins', body: 'DM Sans', label: 'Playful', style: 'Rounded' },
  { id: 'cormorant-lora', heading: 'Cormorant Garamond', body: 'Lora', label: 'Classic', style: 'Serif' },
  { id: 'space-inter', heading: 'Space Grotesk', body: 'Inter', label: 'Technical', style: 'Mono' },
  { id: 'abril-worksans', heading: 'Abril Fatface', body: 'Work Sans', label: 'Bold', style: 'Display' },
]

function select(id) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="font-picker" :class="{ 'font-picker--disabled': disabled }">
    <button
      v-for="pairing in pairings"
      :key="pairing.id"
      type="button"
      class="font-picker__option"
      :class="{ 'font-picker__option--active': modelValue === pairing.id }"
      :disabled="disabled"
      @click="select(pairing.id)"
    >
      <span class="font-picker__preview" :style="{ fontFamily: pairing.heading }">Aa</span>
      <span class="font-picker__info">
        <span class="font-picker__label">{{ pairing.label }}</span>
        <span class="font-picker__fonts">{{ pairing.heading }}</span>
      </span>
      <Icon v-if="modelValue === pairing.id" name="lucide:check" size="14" class="font-picker__check" />
    </button>
  </div>
</template>

<style scoped>
.font-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-2);
}

.font-picker--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.font-picker__option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  font-family: var(--font-family);
  position: relative;
}

.font-picker__option:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
}

.font-picker__option--active {
  border-color: var(--color-accent);
  background: var(--color-accent-bg);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

.font-picker__preview {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  min-width: 36px;
  text-align: center;
}

.font-picker__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.font-picker__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.font-picker__fonts {
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-picker__check {
  color: var(--color-accent);
  flex-shrink: 0;
}
</style>
