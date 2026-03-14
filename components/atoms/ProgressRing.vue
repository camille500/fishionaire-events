<script setup>
const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
  },
  size: {
    type: Number,
    default: 48,
  },
  strokeWidth: {
    type: Number,
    default: 4,
  },
  color: {
    type: String,
    default: 'var(--color-accent)',
  },
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() =>
  circumference.value - (props.percentage / 100) * circumference.value
)
</script>

<template>
  <div class="progress-ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" class="progress-ring__svg">
      <circle
        class="progress-ring__track"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
      />
      <circle
        class="progress-ring__fill"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
      />
    </svg>
    <span class="progress-ring__label">
      <slot>{{ Math.round(percentage) }}%</slot>
    </span>
  </div>
</template>

<style scoped>
.progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-ring__svg {
  transform: rotate(-90deg);
}

.progress-ring__track {
  stroke: var(--color-neutral-200, rgba(0, 0, 0, 0.12));
}

.progress-ring__fill {
  transition: stroke-dashoffset 0.6s ease;
}

.progress-ring__label {
  position: absolute;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}
</style>
