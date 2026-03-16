<script setup>
const { t } = useI18n()

const props = defineProps({
  current: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    required: true,
  },
})

const percentage = computed(() => Math.min((props.current / props.max) * 100, 100))
const isFull = computed(() => props.current >= props.max)
</script>

<template>
  <div class="capacity-indicator">
    <div class="capacity-indicator__bar">
      <div
        class="capacity-indicator__fill"
        :class="{ 'capacity-indicator__fill--full': isFull }"
        :style="{ width: `${percentage}%` }"
      />
    </div>
    <span class="capacity-indicator__text" :class="{ 'capacity-indicator__text--full': isFull }">
      {{ isFull ? t('editor.capacity.full') : `${current}/${max}` }}
    </span>
  </div>
</template>

<style scoped>
.capacity-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.capacity-indicator__bar {
  flex: 1;
  height: 4px;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
  min-width: 40px;
  max-width: 80px;
}

.capacity-indicator__fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

.capacity-indicator__fill--full {
  background: var(--color-error, #ef4444);
}

.capacity-indicator__text {
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.capacity-indicator__text--full {
  color: var(--color-error, #ef4444);
  font-weight: var(--font-weight-medium);
}
</style>
