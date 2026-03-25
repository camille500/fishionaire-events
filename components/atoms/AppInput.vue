<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [String, Boolean],
    default: false,
  },
  id: {
    type: String,
    default: undefined,
  },
  name: {
    type: String,
    default: undefined,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

function onInput(e) {
  const value = props.type === 'number' ? e.target.valueAsNumber : e.target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="app-input"
    :class="[
      `app-input--${size}`,
      {
        'app-input--error': !!error,
        'app-input--disabled': disabled,
        'app-input--has-icon': !!icon,
      },
    ]"
  >
    <Icon v-if="icon" :name="icon" class="app-input__icon" />
    <input
      v-bind="$attrs"
      :id="id"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autofocus="autofocus"
      :aria-invalid="!!error || undefined"
      :aria-describedby="error && typeof error === 'string' && id ? `${id}-error` : undefined"
      class="app-input__field"
      @input="onInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <slot name="trailing" />
  </div>
</template>

<style scoped>
.app-input {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  background: var(--input-bg, var(--color-surface));
  border: 1px solid var(--input-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}

.app-input:hover:not(.app-input--disabled) {
  border-color: var(--color-border);
}

.app-input:focus-within:not(.app-input--disabled) {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
  background: var(--color-surface);
}

.app-input--error {
  border-color: var(--color-error);
}

.app-input--error:focus-within {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 12%, transparent);
}

.app-input--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Sizes */
.app-input--sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
}

.app-input--md {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

.app-input--lg {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
}

/* Icon */
.app-input__icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
  width: 1em;
  height: 1em;
}

/* Field */
.app-input__field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: inherit;
  color: var(--color-text-primary);
  padding: 0;
  min-width: 0;
}

.app-input__field::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.app-input__field:disabled {
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .app-input {
    transition: none;
  }
}
</style>
