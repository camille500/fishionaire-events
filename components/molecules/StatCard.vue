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
    :animate="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
    class="stat-card"
  >
    <div class="stat-card__icon" :style="{ '--icon-color': color }">
      <Icon :name="'lucide:' + icon" size="24" />
    </div>
    <div class="stat-card__value">{{ value }}</div>
    <div class="stat-card__label">{{ label }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  will-change: transform;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 184, 148, 0.12);
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
  background: color-mix(in srgb, var(--icon-color) 8%, var(--color-background));
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
