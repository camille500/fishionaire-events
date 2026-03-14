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
    default: '',
  },
  to: {
    type: String,
    default: null,
  },
  color: {
    type: String,
    default: 'var(--color-accent)',
  },
})

const emit = defineEmits(['click'])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="quick-action"
  >
    <div class="quick-action__icon" :style="{ '--icon-color': color }">
      <Icon :name="'lucide:' + icon" size="24" />
    </div>
    <div class="quick-action__text">
      <span class="quick-action__label">{{ label }}</span>
      <span v-if="description" class="quick-action__description">{{ description }}</span>
    </div>
    <Icon name="lucide:chevron-right" size="16" class="quick-action__arrow" />
  </NuxtLink>
  <button
    v-else
    class="quick-action"
    @click="emit('click')"
  >
    <div class="quick-action__icon" :style="{ '--icon-color': color }">
      <Icon :name="'lucide:' + icon" size="24" />
    </div>
    <div class="quick-action__text">
      <span class="quick-action__label">{{ label }}</span>
      <span v-if="description" class="quick-action__description">{{ description }}</span>
    </div>
    <Icon name="lucide:chevron-right" size="16" class="quick-action__arrow" />
  </button>
</template>

<style scoped>
.quick-action {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font: inherit;
  transition: all 0.3s ease;
  will-change: transform;
}

.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 184, 148, 0.2);
}

.quick-action:active {
  transform: translateY(0);
}

.quick-action__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--icon-color);
  background: color-mix(in srgb, var(--icon-color) 8%, var(--color-background));
}

.quick-action__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quick-action__label {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.quick-action__description {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.quick-action__arrow {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.quick-action:hover .quick-action__arrow {
  transform: translateX(2px);
  color: var(--color-accent);
}
</style>
