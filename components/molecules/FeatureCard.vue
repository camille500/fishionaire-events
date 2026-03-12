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
      <Icon :name="'lucide:' + icon" size="28" />
    </div>
    <AppHeading :level="3" class="feature-card__title">{{ title }}</AppHeading>
    <AppText size="sm" class="feature-card__desc">{{ description }}</AppText>
  </div>
</template>

<style scoped>
.feature-card {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  transition: all var(--transition-base);
  border: 1px solid var(--color-border-light);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-accent);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  margin-bottom: var(--space-5);
  transition: all var(--transition-base);
}

.feature-card:hover .feature-card__icon {
  background: var(--gradient-accent);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-accent-sm);
  transform: translateY(-2px);
}

.feature-card__title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
}

.feature-card__desc {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}
</style>
