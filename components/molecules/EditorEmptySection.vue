<script setup>
const { t } = useI18n()

defineProps({
  icon: {
    type: String,
    default: 'lucide:inbox',
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
  locked: {
    type: Boolean,
    default: false,
  },
  upgradeLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="empty-section" :class="{ 'empty-section--locked': locked }">
    <div class="empty-section__icon-wrapper">
      <Icon :name="locked ? 'lucide:lock' : icon" size="28" class="empty-section__icon" />
    </div>
    <div class="empty-section__text">
      <span class="empty-section__title">{{ title }}</span>
      <span v-if="description" class="empty-section__description">{{ description }}</span>
    </div>
    <AppButton
      v-if="locked && upgradeLabel"
      variant="primary"
      size="sm"
      to="/pricing"
    >
      <Icon name="lucide:crown" size="14" />
      {{ upgradeLabel }}
    </AppButton>
    <AppButton
      v-else-if="ctaLabel && !locked"
      variant="ghost"
      size="sm"
      @click="emit('action')"
    >
      {{ ctaLabel }}
    </AppButton>
  </div>
</template>

<style scoped>
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-4);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
}

.empty-section--locked {
  border-color: var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 50%, transparent);
}

.empty-section__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
}

.empty-section--locked .empty-section__icon-wrapper {
  background: color-mix(in srgb, var(--color-text-muted) 8%, transparent);
}

.empty-section__icon {
  color: var(--color-accent);
  opacity: 0.6;
}

.empty-section--locked .empty-section__icon {
  color: var(--color-text-muted);
}

.empty-section__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.empty-section__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.empty-section__description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  max-width: 280px;
  line-height: var(--line-height-normal);
}
</style>
