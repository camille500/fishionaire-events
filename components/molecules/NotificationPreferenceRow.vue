<script setup>
defineProps({
  category: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  email: {
    type: Boolean,
    default: false,
  },
  emailDisabled: {
    type: Boolean,
    default: false,
  },
  tierLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:email'])
</script>

<template>
  <div class="pref-row">
    <div class="pref-row__info">
      <span class="pref-row__label">{{ label }}</span>
      <span v-if="description" class="pref-row__description">{{ description }}</span>
    </div>
    <div class="pref-row__controls">
      <div class="pref-row__toggle">
        <AppSwitch
          :model-value="email"
          :disabled="emailDisabled"
          @update:model-value="emit('update:email', $event)"
        />
        <TierBadge v-if="tierLabel && emailDisabled" :tier="tierLabel" size="xs" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
}

.pref-row + .pref-row {
  border-top: 1px solid var(--color-border-light);
}

.pref-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pref-row__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.pref-row__description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

.pref-row__controls {
  flex-shrink: 0;
}

.pref-row__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
