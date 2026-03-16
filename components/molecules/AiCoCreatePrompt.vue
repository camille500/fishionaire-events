<script setup>
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'generate'])

const charCount = computed(() => props.modelValue.length)
</script>

<template>
  <div class="ai-prompt" :class="{ 'ai-prompt--compact': compact }">
    <div v-if="!compact" class="ai-prompt__header">
      <div class="ai-prompt__icon-wrapper">
        <Icon name="lucide:sparkles" size="20" class="ai-prompt__icon" />
      </div>
      <div class="ai-prompt__text">
        <span class="ai-prompt__title">{{ t('editor.coCreate.title') }}</span>
        <span class="ai-prompt__subtitle">{{ t('editor.coCreate.subtitle') }}</span>
      </div>
    </div>

    <div class="ai-prompt__input-wrapper">
      <textarea
        class="ai-prompt__textarea"
        :value="modelValue"
        :placeholder="t('editor.coCreate.placeholder')"
        :disabled="loading"
        :rows="compact ? 2 : 3"
        @input="emit('update:modelValue', $event.target.value)"
        @keydown.meta.enter="emit('generate')"
        @keydown.ctrl.enter="emit('generate')"
      />
      <span class="ai-prompt__char-count">{{ charCount }}/500</span>
    </div>

    <div class="ai-prompt__actions">
      <AppButton
        variant="primary"
        size="sm"
        :disabled="loading || !modelValue.trim()"
        @click="emit('generate')"
      >
        <Icon name="lucide:sparkles" size="14" :class="{ 'ai-prompt__spinner': loading }" />
        {{ loading ? t('editor.coCreate.loading') : t('editor.coCreate.generate') }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.ai-prompt {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.ai-prompt__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.ai-prompt__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  flex-shrink: 0;
}

.ai-prompt__icon {
  color: var(--color-accent);
}

.ai-prompt__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-prompt__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.ai-prompt__subtitle {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.ai-prompt__input-wrapper {
  position: relative;
}

.ai-prompt__textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  resize: vertical;
  line-height: var(--line-height-normal);
  transition: border-color var(--transition-fast);
}

.ai-prompt__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

.ai-prompt__textarea::placeholder {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.ai-prompt__textarea:disabled {
  opacity: 0.6;
}

.ai-prompt__char-count {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-3);
  font-size: 10px;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.ai-prompt__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ai-prompt__spinner {
  animation: spin 1s linear infinite;
}

.ai-prompt--compact .ai-prompt__textarea {
  font-size: var(--text-xs);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
