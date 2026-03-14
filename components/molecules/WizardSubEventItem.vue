<script setup>
const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue', 'remove'])

const title = computed({
  get: () => props.modelValue.title,
  set: (val) => emit('update:modelValue', { ...props.modelValue, title: val }),
})
</script>

<template>
  <div class="wizard-sub-event">
    <div class="wizard-sub-event__drag">
      <Icon name="lucide:grip-vertical" size="14" />
    </div>
    <input
      v-model="title"
      type="text"
      class="wizard-sub-event__title"
      :placeholder="t('wizard.activityPlaceholder')"
    />
    <span v-if="modelValue.durationMinutes" class="wizard-sub-event__duration">
      {{ modelValue.durationMinutes }} {{ t('wizard.durationLabel') }}
    </span>
    <button type="button" class="wizard-sub-event__remove" @click="emit('remove')">
      <Icon name="lucide:x" size="14" />
    </button>
  </div>
</template>

<style scoped>
.wizard-sub-event {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.wizard-sub-event:hover {
  border-color: var(--color-border);
}

.wizard-sub-event__drag {
  color: var(--color-text-muted);
  cursor: grab;
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.wizard-sub-event:hover .wizard-sub-event__drag {
  opacity: 1;
}

.wizard-sub-event__title {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding: var(--space-1) 0;
}

.wizard-sub-event__title::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.wizard-sub-event__duration {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-background-alt);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.wizard-sub-event__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.wizard-sub-event__remove:hover {
  background: rgba(231, 76, 60, 0.1);
  color: var(--color-error);
}
</style>
