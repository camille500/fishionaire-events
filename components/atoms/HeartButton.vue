<script setup>
defineProps({
  count: {
    type: Number,
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['heart'])
const animating = ref(false)

function handleClick() {
  if (animating.value) return
  animating.value = true
  emit('heart')
  setTimeout(() => { animating.value = false }, 400)
}
</script>

<template>
  <button
    class="heart-button"
    :class="{ 'heart-button--animating': animating }"
    :disabled="disabled"
    @click="handleClick"
  >
    <Icon name="lucide:heart" size="16" class="heart-button__icon" />
    <span v-if="count > 0" class="heart-button__count">{{ count }}</span>
  </button>
</template>

<style scoped>
.heart-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  transition: all var(--transition-fast);
}

.heart-button:hover:not(:disabled) {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.heart-button:disabled {
  cursor: default;
  opacity: 0.5;
}

.heart-button--animating .heart-button__icon {
  color: var(--color-accent);
  animation: heart-pop 0.4s ease;
}

.heart-button__count {
  font-weight: var(--font-weight-medium);
  min-width: 12px;
  text-align: center;
}

@keyframes heart-pop {
  0% { transform: scale(1); }
  30% { transform: scale(1.4); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
</style>
