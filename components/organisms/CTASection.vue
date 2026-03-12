<script setup>
const localePath = useLocalePath()

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  ctaLabel: {
    type: String,
    required: true,
  },
  ctaTo: {
    type: String,
    default: '/sign-up',
  },
})
</script>

<template>
  <section class="cta-section">
    <div class="cta-section__bg" />
    <div class="cta-section__particles" aria-hidden="true">
      <span v-for="n in 8" :key="n" class="cta-section__particle" :style="{
        left: (n * 12 + 2) % 96 + '%',
        top: (n * 11 + 8) % 88 + '%',
        animationDelay: (n * 0.5) + 's',
        animationDuration: (4 + (n % 3)) + 's',
      }" />
    </div>
    <div
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :visible-once="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 25 } }"
      class="cta-section__container"
    >
      <AppHeading :level="2" align="center" class="cta-section__title">
        {{ title }}
      </AppHeading>
      <AppText v-if="subtitle" size="lg" align="center" class="cta-section__subtitle">
        {{ subtitle }}
      </AppText>
      <AppButton variant="gradient" :to="localePath(ctaTo)" size="lg" class="cta-section__button">
        {{ ctaLabel }}
      </AppButton>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  position: relative;
  padding: var(--space-20) var(--space-6);
  overflow: hidden;
}

.cta-section__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 30% 50%, rgba(255, 107, 107, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 50%, rgba(255, 154, 86, 0.08) 0%, transparent 50%),
    var(--gradient-hero);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

.cta-section__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.cta-section__particle {
  position: absolute;
  width: 5px;
  height: 5px;
  background: rgba(255, 107, 107, 0.25);
  border-radius: 50%;
  animation: float ease-in-out infinite;
}

.cta-section__container {
  max-width: var(--max-width-narrow);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  position: relative;
}

.cta-section__title {
  color: var(--color-text-inverse);
}

.cta-section__subtitle {
  color: rgba(255, 255, 255, 0.75);
}

.cta-section__button {
  margin-top: var(--space-4);
}
</style>
