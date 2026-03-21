<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue'])

const fallbackId = useId()
const switchId = computed(() => props.id || fallbackId)

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="app-switch" :class="{ 'app-switch--disabled': disabled }">
    <button
      type="button"
      role="switch"
      :id="switchId"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="app-switch__track"
      :class="{ 'app-switch__track--on': modelValue }"
      @click="toggle"
    >
      <span class="app-switch__knob" />
    </button>
    <div v-if="label || description" class="app-switch__content" @click="toggle">
      <label v-if="label" :for="switchId" class="app-switch__label">{{ label }}</label>
      <span v-if="description" class="app-switch__description">{{ description }}</span>
    </div>
  </div>
</template>

<style scoped>
.app-switch {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.app-switch--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Track */
.app-switch__track {
  position: relative;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-text-primary) 16%, transparent);
  cursor: pointer;
  padding: 0;
  transition: background var(--transition-fast);
  margin-top: 2px;
}

.app-switch__track:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-text-primary) 24%, transparent);
}

.app-switch__track--on {
  background: var(--color-accent);
}

.app-switch__track--on:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.app-switch__track:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.app-switch__track:disabled {
  cursor: not-allowed;
}

/* Knob */
.app-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: var(--radius-full);
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.app-switch__track--on .app-switch__knob {
  transform: translateX(16px);
}

/* Content */
.app-switch__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  min-width: 0;
}

.app-switch--disabled .app-switch__content {
  cursor: not-allowed;
}

.app-switch__label {
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
}

.app-switch__description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

@media (prefers-reduced-motion: reduce) {
  .app-switch__track,
  .app-switch__knob {
    transition: none;
  }
}
</style>
