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
  whileInView: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.1 } },
}))
</script>

<template>
  <section
    v-motion
    :initial="motionConfig.initial"
    :whileInView="motionConfig.whileInView"
    :inViewOptions="{ once: true }"
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
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  margin-bottom: var(--space-4);
}

.feature-showcase__title {
  font-size: clamp(1.4rem, 2.5vw, 1.75rem);
  margin-bottom: var(--space-4);
  letter-spacing: -0.02em;
}

.feature-showcase__description {
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.feature-showcase__visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-showcase__placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.feature-showcase__placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(0, 184, 148, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(108, 92, 231, 0.04) 0%, transparent 50%);
  pointer-events: none;
}

.feature-showcase__placeholder:hover {
  border-color: transparent;
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-showcase__placeholder-icon {
  opacity: 0.15;
  transition: all 0.3s ease;
  z-index: 1;
}

.feature-showcase__placeholder:hover .feature-showcase__placeholder-icon {
  opacity: 0.3;
  transform: scale(1.1);
}

.feature-showcase__placeholder-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 184, 148, 0.08), transparent 70%);
  pointer-events: none;
  transition: opacity 0.3s ease;
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
