<script setup>
const { locale } = useI18n()

defineProps({
  date: { type: String, required: true },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
  removable: { type: Boolean, default: true },
})

const emit = defineEmits(['remove'])

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(locale.value === 'nl' ? 'nl-NL' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTime(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleTimeString(locale.value === 'nl' ? 'nl-NL' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <span class="date-chip">
    <Icon name="lucide:calendar" size="12" class="date-chip__icon" />
    <span class="date-chip__label">{{ formatShortDate(date) }}</span>
    <span v-if="startTime" class="date-chip__time">
      {{ formatTime(startTime) }}
      <template v-if="endTime">–{{ formatTime(endTime) }}</template>
    </span>
    <button
      v-if="removable"
      type="button"
      class="date-chip__remove"
      @click.stop="emit('remove')"
    >
      <Icon name="lucide:x" size="10" />
    </button>
  </span>
</template>

<style scoped>
.date-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.date-chip:hover {
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
}

.date-chip__icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.date-chip__label {
  font-weight: var(--font-weight-medium);
}

.date-chip__time {
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.date-chip__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  margin-left: var(--space-1);
}

.date-chip__remove:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
}
</style>
