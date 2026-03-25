<script setup>
const props = defineProps({
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
  locked: {
    type: Boolean,
    default: false,
  },
  tierBadge: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'locked-click'])

function handleClick() {
  if (props.locked) {
    emit('locked-click')
  }
}
</script>

<template>
  <div
    class="feature-toggle"
    :class="{
      'feature-toggle--active': modelValue && !locked,
      'feature-toggle--locked': locked,
    }"
    @click="handleClick"
  >
    <div class="feature-toggle__icon">
      <Icon :name="'lucide:' + icon" size="16" />
      <Icon v-if="locked" name="lucide:lock" size="10" class="feature-toggle__lock-icon" />
    </div>
    <div class="feature-toggle__info">
      <AppSwitch
        :model-value="modelValue"
        :label="label"
        :description="description"
        :disabled="locked"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
    <span v-if="tierBadge" class="feature-toggle__tier-badge">
      {{ tierBadge }}
    </span>
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

.feature-toggle--locked {
  opacity: 0.6;
  cursor: pointer;
  border-color: var(--color-border);
}

.feature-toggle--locked:hover {
  opacity: 0.8;
  border-color: var(--color-accent-light);
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
  position: relative;
}

.feature-toggle--active .feature-toggle__icon {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.feature-toggle--locked .feature-toggle__icon {
  color: var(--color-text-muted);
}

.feature-toggle__lock-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  padding: 1px;
  color: var(--color-text-muted);
}

.feature-toggle__info {
  flex: 1;
  min-width: 0;
}

.feature-toggle__tier-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  background: var(--color-accent-bg);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
