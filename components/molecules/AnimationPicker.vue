<script setup>
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: 'fadeUp',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const animations = [
  { id: 'fadeUp', label: 'Fade Up', icon: 'lucide:arrow-up', desc: 'Gentle rise' },
  { id: 'typewriter', label: 'Typewriter', icon: 'lucide:type', desc: 'Letter by letter' },
  { id: 'cinematic', label: 'Cinematic', icon: 'lucide:clapperboard', desc: 'Dramatic zoom' },
  { id: 'slide', label: 'Slide', icon: 'lucide:move-horizontal', desc: 'Side entrance' },
]

function select(id) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="anim-picker" :class="{ 'anim-picker--disabled': disabled }">
    <button
      v-for="anim in animations"
      :key="anim.id"
      type="button"
      class="anim-picker__option"
      :class="{ 'anim-picker__option--active': modelValue === anim.id }"
      :disabled="disabled"
      @click="select(anim.id)"
    >
      <Icon :name="anim.icon" size="18" />
      <span class="anim-picker__label">{{ anim.label }}</span>
      <span class="anim-picker__desc">{{ anim.desc }}</span>
    </button>
  </div>
</template>

<style scoped>
.anim-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-2);
}

.anim-picker--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.anim-picker__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  text-align: center;
}

.anim-picker__option :deep(.iconify) {
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.anim-picker__option:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}

.anim-picker__option:hover :deep(.iconify) {
  color: var(--color-accent);
}

.anim-picker__option--active {
  border-color: var(--color-accent);
  background: var(--color-accent-bg);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

.anim-picker__option--active :deep(.iconify) {
  color: var(--color-accent);
}

.anim-picker__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.anim-picker__desc {
  font-size: 10px;
  color: var(--color-text-muted);
}
</style>
