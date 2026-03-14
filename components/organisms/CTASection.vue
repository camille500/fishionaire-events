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
    <!-- Aurora background -->
    <div class="cta-section__aurora" aria-hidden="true">
      <div class="cta-section__aurora-layer cta-section__aurora-layer--cyan" />
      <div class="cta-section__aurora-layer cta-section__aurora-layer--violet" />
    </div>
    <div class="cta-section__particles" aria-hidden="true">
      <span v-for="n in 8" :key="n" class="cta-section__particle" :style="{
        left: (n * 12 + 2) % 96 + '%',
        top: (n * 11 + 8) % 88 + '%',
        animationDelay: (n * 0.5) + 's',
        animationDuration: (4 + (n % 3)) + 's',
      }" />
    </div>
    <div class="cta-section__container reveal">
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
  background: linear-gradient(135deg, #f0f4f8 0%, #e8edf5 50%, #f5f0fa 100%);
}

:global(.dark) .cta-section {
  background: #030306;
}

.cta-section__aurora {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.cta-section__aurora-layer {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: aurora-shift 20s ease-in-out infinite, aurora-drift 25s ease-in-out infinite;
}

.cta-section__aurora-layer--cyan {
  width: 400px;
  height: 400px;
  top: 10%;
  left: 20%;
  background: radial-gradient(circle, rgba(0, 184, 148, 0.1) 0%, transparent 70%);
}

:global(.dark) .cta-section__aurora-layer--cyan {
  background: radial-gradient(circle, rgba(0, 184, 148, 0.2) 0%, transparent 70%);
}

.cta-section__aurora-layer--violet {
  width: 350px;
  height: 350px;
  bottom: 5%;
  right: 15%;
  background: radial-gradient(circle, rgba(108, 92, 231, 0.08) 0%, transparent 70%);
  animation-delay: -8s;
}

:global(.dark) .cta-section__aurora-layer--violet {
  background: radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%);
}

.cta-section__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.cta-section__particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(0, 184, 148, 0.2);
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
  z-index: 1;
}

.cta-section__title {
  color: var(--text-primary);
}

.cta-section__subtitle {
  color: var(--text-secondary);
}

.cta-section__button {
  margin-top: var(--space-4);
}
</style>
