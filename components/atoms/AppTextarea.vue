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
  rows: {
    type: Number,
    default: 3,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [String, Boolean],
    default: false,
  },
  autoResize: {
    type: Boolean,
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
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const textareaRef = ref(null)

function resize() {
  const el = textareaRef.value
  if (!el || !props.autoResize) return
  el.style.height = 'auto'
  el.style.height = Math.max(el.scrollHeight, 60) + 'px'
}

function onInput(e) {
  emit('update:modelValue', e.target.value)
  nextTick(resize)
}

watch(() => props.modelValue, () => nextTick(resize))
onMounted(() => nextTick(resize))
</script>

<template>
  <div
    class="app-textarea"
    :class="{
      'app-textarea--error': !!error,
      'app-textarea--disabled': disabled,
    }"
  >
    <textarea
      ref="textareaRef"
      :id="id"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      class="app-textarea__field"
      @input="onInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
  </div>
</template>

<style scoped>
.app-textarea {
  width: 100%;
}

.app-textarea__field {
  display: block;
  width: 100%;
  background: var(--input-bg, var(--color-surface));
  border: 1px solid var(--input-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding: var(--space-2) var(--space-3);
  resize: vertical;
  line-height: var(--line-height-normal);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}

.app-textarea--error .app-textarea__field {
  border-color: var(--color-error);
}

.app-textarea--disabled .app-textarea__field {
  opacity: 0.55;
  cursor: not-allowed;
}

.app-textarea__field:hover:not(:disabled) {
  border-color: var(--color-border);
}

.app-textarea__field:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
  background: var(--color-surface);
}

.app-textarea--error .app-textarea__field:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 12%, transparent);
}

.app-textarea__field::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
  .app-textarea__field {
    transition: none;
  }
}
</style>
