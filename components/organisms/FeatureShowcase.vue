<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  reversed: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section class="feature-showcase animate-on-scroll" :class="[reversed ? 'slide-in-right' : 'slide-in-left']">
    <div class="feature-showcase__container" :class="{ 'feature-showcase__container--reversed': reversed }">
      <div class="feature-showcase__content">
        <div class="feature-showcase__icon-wrap">
          <AppIcon :name="icon" size="lg" />
        </div>
        <AppHeading :level="3" class="feature-showcase__title">{{ title }}</AppHeading>
        <AppText size="lg" class="feature-showcase__description">{{ description }}</AppText>
      </div>
      <div class="feature-showcase__visual">
        <div class="feature-showcase__placeholder">
          <AppIcon :name="icon" size="lg" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-showcase__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
}

.feature-showcase__container--reversed {
  direction: rtl;
}

.feature-showcase__container--reversed > * {
  direction: ltr;
}

.feature-showcase__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  margin-bottom: var(--space-4);
}

.feature-showcase__title {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
}

.feature-showcase__description {
  line-height: var(--line-height-relaxed);
}

.feature-showcase__visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-showcase__placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, var(--color-background-alt), var(--color-background));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.feature-showcase__placeholder .app-icon {
  width: 64px;
  height: 64px;
  opacity: 0.3;
}

@media (max-width: 768px) {
  .feature-showcase__container {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .feature-showcase__container--reversed {
    direction: ltr;
  }

  .feature-showcase__visual {
    order: -1;
  }
}
</style>
