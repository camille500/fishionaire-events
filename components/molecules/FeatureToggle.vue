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
  description: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="feature-toggle" :class="{ 'feature-toggle--active': modelValue }">
    <div class="feature-toggle__icon">
      <Icon :name="'lucide:' + icon" size="16" />
    </div>
    <div class="feature-toggle__info">
      <span class="feature-toggle__label">{{ label }}</span>
      <span class="feature-toggle__description">{{ description }}</span>
    </div>
    <button
      class="feature-toggle__switch"
      :class="{ 'feature-toggle__switch--active': modelValue }"
      role="switch"
      :aria-checked="modelValue"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span class="feature-toggle__switch-thumb" />
    </button>
  </div>
</template>

<style scoped>
.feature-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-6);
  transition: all var(--transition-base);
}

.feature-toggle--active {
  border-color: var(--color-accent-light);
  box-shadow: 0 0 0 1px rgba(255, 107, 107, 0.1);
}

.feature-toggle__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-accent);
  flex-shrink: 0;
}

.feature-toggle--active .feature-toggle__icon {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.feature-toggle__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.feature-toggle__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.feature-toggle__description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

.feature-toggle__switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-border);
  cursor: pointer;
  padding: 2px;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.feature-toggle__switch--active {
  background: var(--color-accent);
}

.feature-toggle__switch-thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.feature-toggle__switch--active .feature-toggle__switch-thumb {
  transform: translateX(20px);
}
</style>
