<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['accept', 'dismiss'])
</script>

<template>
  <button
    type="button"
    class="ai-chip"
    @click="emit('accept')"
  >
    <Icon name="lucide:sparkles" size="12" class="ai-chip__sparkle" />
    <span class="ai-chip__content">
      <span class="ai-chip__label">{{ label }}</span>
      <span v-if="subtitle" class="ai-chip__subtitle">{{ subtitle }}</span>
    </span>
    <button
      type="button"
      class="ai-chip__dismiss"
      @click.stop="emit('dismiss')"
    >
      <Icon name="lucide:x" size="10" />
    </button>
  </button>
</template>

<style scoped>
.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2) var(--space-1) var(--space-3);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  animation: chipIn 300ms ease-out;
}

.ai-chip:hover {
  background: var(--color-accent-bg);
  border-color: var(--color-accent-light);
  box-shadow: var(--shadow-accent-sm);
}

.ai-chip__sparkle {
  flex-shrink: 0;
  animation: sparkle 2s ease-in-out infinite;
}

.ai-chip__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 0;
}

.ai-chip__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.ai-chip__subtitle {
  font-size: 0.65rem;
  opacity: 0.7;
  font-weight: var(--font-weight-normal);
}

.ai-chip__dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  color: var(--color-accent);
  cursor: pointer;
  border-radius: var(--radius-full);
  opacity: 0.5;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.ai-chip__dismiss:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
}

@keyframes chipIn {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes sparkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
