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
      <USwitch
        :model-value="modelValue"
        :label="label"
        :description="description"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
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
  box-shadow: 0 0 0 1px rgba(0, 184, 148, 0.1);
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
}
</style>
