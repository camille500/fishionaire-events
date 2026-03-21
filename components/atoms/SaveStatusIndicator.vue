<script setup>
const { t } = useI18n()

defineProps({
  status: {
    type: String,
    default: 'idle',
    validator: (v) => ['idle', 'pending', 'saving', 'saved', 'error'].includes(v),
  },
})
</script>

<template>
  <div class="save-status" :class="`save-status--${status}`">
    <template v-if="status === 'saving'">
      <span class="save-status__spinner" />
      {{ t('dashboard.eventEditor.saving') }}
    </template>
    <template v-else-if="status === 'saved'">
      <Icon name="lucide:check" size="14" />
      {{ t('dashboard.eventEditor.saved') }}
    </template>
    <template v-else-if="status === 'pending'">
      <span class="save-status__dot" />
      {{ t('dashboard.eventEditor.unsavedChanges') }}
    </template>
    <template v-else-if="status === 'error'">
      <Icon name="lucide:alert-circle" size="14" />
      {{ t('dashboard.eventEditor.errorSaving') }}
    </template>
    <template v-else>
      <Icon name="lucide:check" size="14" />
      {{ t('dashboard.eventEditor.allSaved') }}
    </template>
  </div>
</template>

<style scoped>
.save-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  transition: all var(--transition-base);
  white-space: nowrap;
}

.save-status--idle {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.save-status--pending {
  color: var(--color-warning, #ff9f43);
  background: color-mix(in srgb, var(--color-warning, #ff9f43) 8%, transparent);
}

.save-status--saving {
  color: var(--color-text-muted);
}

.save-status--saved {
  color: var(--color-success, #00b894);
  background: color-mix(in srgb, var(--color-success, #00b894) 8%, transparent);
}

.save-status--error {
  color: var(--color-error, #ff6b6b);
  background: color-mix(in srgb, var(--color-error, #ff6b6b) 8%, transparent);
}

.save-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.save-status__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
