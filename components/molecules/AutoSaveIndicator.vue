<script setup>
const { t } = useI18n()

defineProps({
  saving: Boolean,
  saved: Boolean,
  isDirty: Boolean,
  error: { type: String, default: '' },
})
</script>

<template>
  <div class="auto-save">
    <Transition name="fade" mode="out-in">
      <!-- Error -->
      <span v-if="error" class="auto-save__status auto-save__status--error">
        <Icon name="lucide:alert-circle" size="14" />
        {{ error }}
      </span>

      <!-- Saving -->
      <span v-else-if="saving" class="auto-save__status auto-save__status--saving">
        <span class="auto-save__dot auto-save__dot--pulse" />
        {{ t('editor.autoSave.saving') }}
      </span>

      <!-- Saved -->
      <span v-else-if="saved" class="auto-save__status auto-save__status--saved">
        <Icon name="lucide:check" size="14" />
        {{ t('editor.autoSave.saved') }}
      </span>

      <!-- Unsaved -->
      <span v-else-if="isDirty" class="auto-save__status auto-save__status--dirty">
        <span class="auto-save__dot" />
        {{ t('editor.autoSave.unsaved') }}
      </span>

      <!-- Idle -->
      <span v-else class="auto-save__status auto-save__status--idle">
        <Icon name="lucide:cloud" size="14" />
        {{ t('editor.autoSave.allSaved') }}
      </span>
    </Transition>
  </div>
</template>

<style scoped>
.auto-save {
  display: flex;
  align-items: center;
  min-height: 24px;
}

.auto-save__status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.auto-save__status--idle {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.auto-save__status--dirty {
  color: var(--color-warning);
}

.auto-save__status--saving {
  color: var(--color-text-muted);
}

.auto-save__status--saved {
  color: var(--color-success);
}

.auto-save__status--error {
  color: var(--color-error);
}

.auto-save__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.auto-save__dot--pulse {
  animation: pulse-dot 1.2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
