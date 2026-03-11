<script setup>
defineProps({
  icon: {
    type: String,
    default: 'activity',
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'var(--color-text-muted)',
  },
})
</script>

<template>
  <div class="activity-item">
    <div class="activity-item__icon" :style="{ color }">
      <AppIcon :name="icon" size="sm" />
    </div>
    <div class="activity-item__content">
      <span class="activity-item__message">{{ message }}</span>
      <span class="activity-item__time">{{ timestamp }}</span>
    </div>
  </div>
</template>

<style scoped>
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  transition: background var(--transition-fast);
  border-radius: var(--radius-sm);
}

.activity-item + .activity-item {
  border-top: 1px solid var(--color-border);
}

.activity-item__icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-item__message {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

.activity-item__time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
