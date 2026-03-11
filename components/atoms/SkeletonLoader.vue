<script setup>
defineProps({
  variant: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'circle', 'card', 'stat'].includes(v),
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: null,
  },
  lines: {
    type: Number,
    default: 3,
  },
})
</script>

<template>
  <div :class="['skeleton', `skeleton--${variant}`]">
    <template v-if="variant === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        class="skeleton__line"
        :style="{
          width: i === lines ? '60%' : width,
          height: height || '14px',
        }"
      />
    </template>

    <div
      v-else-if="variant === 'circle'"
      class="skeleton__circle"
      :style="{ width: width === '100%' ? '48px' : width, height: width === '100%' ? '48px' : width }"
    />

    <div v-else-if="variant === 'card'" class="skeleton__card">
      <div class="skeleton__card-header">
        <div class="skeleton__circle" style="width: 40px; height: 40px" />
        <div class="skeleton__card-meta">
          <div class="skeleton__line" style="width: 60%; height: 14px" />
          <div class="skeleton__line" style="width: 40%; height: 12px" />
        </div>
      </div>
      <div class="skeleton__line" style="width: 100%; height: 14px" />
      <div class="skeleton__line" style="width: 80%; height: 14px" />
    </div>

    <div v-else-if="variant === 'stat'" class="skeleton__stat">
      <div class="skeleton__circle" style="width: 44px; height: 44px" />
      <div class="skeleton__line" style="width: 50%; height: 28px" />
      <div class="skeleton__line" style="width: 70%; height: 12px" />
    </div>
  </div>
</template>

<style scoped>
.skeleton__line,
.skeleton__circle {
  background: linear-gradient(
    90deg,
    var(--color-skeleton) 25%,
    var(--color-skeleton-highlight) 50%,
    var(--color-skeleton) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton__circle {
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.skeleton--text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.skeleton__card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.skeleton__card-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton__stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
</style>
