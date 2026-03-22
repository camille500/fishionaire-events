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

const presets = [
  '#e91e63', '#9b59b6', '#4caf50', '#ff9800', '#2196f3',
  '#00b894', '#ff6b6b', '#6c5ce7', '#fd79a8', '#00cec9',
]

const hexInput = ref(props.modelValue || '')
const nativePickerRef = ref(null)

watch(() => props.modelValue, (val) => {
  hexInput.value = val || ''
})

function selectPreset(color) {
  emit('update:modelValue', color)
}

function openNativePicker() {
  nativePickerRef.value?.click()
}

function onNativeChange(e) {
  const color = e.target.value
  hexInput.value = color
  emit('update:modelValue', color)
}

function onHexBlur() {
  const val = hexInput.value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    emit('update:modelValue', val)
  } else if (/^[0-9a-fA-F]{6}$/.test(val)) {
    const color = '#' + val
    hexInput.value = color
    emit('update:modelValue', color)
  } else {
    hexInput.value = props.modelValue || ''
  }
}

function clearColor() {
  hexInput.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="color-picker" :class="{ 'color-picker--disabled': disabled }">
    <div class="color-picker__presets" role="radiogroup" :aria-label="t('editor.details.customColor')">
      <button
        v-for="color in presets"
        :key="color"
        type="button"
        role="radio"
        class="color-picker__swatch"
        :class="{ 'color-picker__swatch--active': modelValue === color }"
        :style="{ '--swatch-color': color }"
        :aria-checked="modelValue === color"
        :aria-label="color"
        :disabled="disabled"
        @click="selectPreset(color)"
      >
        <Icon v-if="modelValue === color" name="lucide:check" size="12" class="color-picker__check" />
      </button>
    </div>

    <div class="color-picker__custom">
      <button
        type="button"
        class="color-picker__native-trigger"
        :style="modelValue ? { background: modelValue } : {}"
        :disabled="disabled"
        :aria-label="t('editor.details.customHex')"
        @click="openNativePicker"
      >
        <Icon v-if="!modelValue" name="lucide:pipette" size="14" />
      </button>
      <input
        ref="nativePickerRef"
        type="color"
        class="color-picker__native"
        :value="modelValue || '#00b894'"
        :disabled="disabled"
        @input="onNativeChange"
      />
      <div class="color-picker__hex-group">
        <input
          v-model="hexInput"
          type="text"
          class="color-picker__hex-input"
          placeholder="#000000"
          maxlength="7"
          :disabled="disabled"
          @blur="onHexBlur"
          @keydown.enter="onHexBlur"
        />
      </div>
      <button
        v-if="modelValue"
        type="button"
        class="color-picker__clear"
        :aria-label="t('common.clear')"
        @click="clearColor"
      >
        <Icon name="lucide:x" size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.color-picker--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.color-picker__presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.color-picker__swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--swatch-color);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
}

.color-picker__swatch:hover {
  transform: scale(1.15);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--swatch-color) 25%, transparent);
}

.color-picker__swatch:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.color-picker__swatch--active {
  border-color: var(--color-text-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--swatch-color) 30%, transparent);
  transform: scale(1.1);
}

.color-picker__check {
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.color-picker__custom {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.color-picker__native-trigger {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.color-picker__native-trigger:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.color-picker__native {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.color-picker__hex-group {
  display: flex;
  align-items: center;
}

.color-picker__hex-input {
  width: 90px;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-fast);
}

.color-picker__hex-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.color-picker__hex-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.color-picker__clear {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.color-picker__clear:hover {
  background: var(--color-background);
  color: var(--color-error);
}
</style>
