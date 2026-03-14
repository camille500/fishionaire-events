<script setup>
defineProps({
  saving: {
    type: Boolean,
    default: false,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  isDirty: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  saveLabel: {
    type: String,
    default: '',
  },
  savingLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['save'])
</script>

<template>
  <div class="editor-save-bar">
    <div class="editor-save-bar__inner">
      <div class="editor-save-bar__left">
        <AppButton
          :variant="isDirty ? 'gradient' : 'primary'"
          size="sm"
          :disabled="disabled || saving"
          @click="emit('save')"
        >
          {{ saving ? savingLabel : saveLabel }}
        </AppButton>
        <AutoSaveIndicator
          :saving="saving"
          :saved="saved"
          :is-dirty="isDirty"
          :error="error"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-save-bar {
  position: sticky;
  bottom: 0;
  margin-top: var(--space-8);
  margin-left: calc(-1 * var(--space-6));
  margin-right: calc(-1 * var(--space-6));
  padding: 0 var(--space-6);
}

.editor-save-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}

.editor-save-bar__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

@media (max-width: 640px) {
  .editor-save-bar__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
