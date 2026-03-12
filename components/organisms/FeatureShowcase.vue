<script setup>
const props = defineProps({
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

const motionConfig = computed(() => ({
  initial: { opacity: 0, x: props.reversed ? 60 : -60 },
  visibleOnce: { opacity: 1, x: 0, transition: { duration: 600, delay: 100 } },
}))
</script>

<template>
  <section
    v-motion
    :initial="motionConfig.initial"
    :visible-once="motionConfig.visibleOnce"
    class="feature-showcase"
  >
    <div class="feature-showcase__container" :class="{ 'feature-showcase__container--reversed': reversed }">
      <div class="feature-showcase__content">
        <div class="feature-showcase__icon-wrap">
          <Icon :name="'lucide:' + icon" size="28" />
        </div>
        <AppHeading :level="3" class="feature-showcase__title">{{ title }}</AppHeading>
        <AppText size="lg" class="feature-showcase__description">{{ description }}</AppText>
      </div>
      <div class="feature-showcase__visual">
        <div class="feature-showcase__placeholder">
          <div class="feature-showcase__placeholder-icon">
            <Icon :name="'lucide:' + icon" size="48" />
          </div>
          <div class="feature-showcase__placeholder-glow" />
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
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--gradient-accent);
  color: var(--color-text-inverse);
  margin-bottom: var(--space-4);
  box-shadow: var(--shadow-accent-sm);
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
  background: var(--gradient-surface);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-light);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);
}

.feature-showcase__placeholder:hover {
  border-color: rgba(255, 107, 107, 0.2);
  box-shadow: var(--shadow-md);
}

.feature-showcase__placeholder-icon {
  opacity: 0.2;
  transition: all var(--transition-base);
}

.feature-showcase__placeholder:hover .feature-showcase__placeholder-icon {
  opacity: 0.35;
  transform: scale(1.1);
}

.feature-showcase__placeholder-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.08), transparent 70%);
  pointer-events: none;
  transition: opacity var(--transition-base);
  opacity: 0;
}

.feature-showcase__placeholder:hover .feature-showcase__placeholder-glow {
  opacity: 1;
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
