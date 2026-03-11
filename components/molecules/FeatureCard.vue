<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="feature-card">
    <div class="feature-card__icon">
      <AppIcon :name="icon" size="lg" />
    </div>
    <AppHeading :level="3" class="feature-card__title">{{ title }}</AppHeading>
    <AppText size="sm">{{ description }}</AppText>
  </div>
</template>

<style scoped>
.feature-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  transition: all var(--transition-base);
  border: 1px solid var(--color-border);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

.feature-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--color-background);
  color: var(--color-accent);
  margin-bottom: var(--space-4);
}

.feature-card__title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
}
</style>
