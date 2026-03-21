<script setup>
</script>

<template>
  <div class="typing-indicator">
    <div class="typing-indicator__avatar">
      <Icon name="lucide:sparkles" size="14" />
    </div>
    <div class="typing-indicator__dots">
      <span class="typing-indicator__dot" />
      <span class="typing-indicator__dot" />
      <span class="typing-indicator__dot" />
    </div>
  </div>
</template>

<style scoped>
.typing-indicator {
  display: flex;
  gap: var(--space-2);
  align-self: flex-start;
}

.typing-indicator__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  flex-shrink: 0;
}

.typing-indicator__dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
}

.typing-indicator__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-muted);
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-indicator__dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator__dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}
</style>
