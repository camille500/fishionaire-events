<script setup>
defineProps({
  icon: {
    type: String,
    default: 'calendar',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  ctaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['cta-click'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <Icon :name="'lucide:' + icon" size="32" />
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <AppButton
      v-if="ctaLabel"
      variant="primary"
      size="sm"
      class="empty-state__cta"
      @click="emit('cta-click')"
    >
      {{ ctaLabel }}
    </AppButton>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  border: 2px dashed var(--color-border-light);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.empty-state__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state__description {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: var(--space-2) 0 0;
  max-width: 320px;
}

.empty-state__cta {
  margin-top: var(--space-6);
}
</style>
