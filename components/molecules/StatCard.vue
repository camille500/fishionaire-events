<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  color: {
    type: String,
    default: 'var(--color-accent)',
  },
})
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
    class="stat-card"
  >
    <div class="stat-card__icon" :style="{ '--icon-color': color }">
      <AppIcon :name="icon" size="md" />
    </div>
    <div class="stat-card__value">{{ value }}</div>
    <div class="stat-card__label">{{ label }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  will-change: transform;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-card__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
  color: var(--icon-color);
  background: var(--color-background);
}

.stat-card__value {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.stat-card__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}
</style>
