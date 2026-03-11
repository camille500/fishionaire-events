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
    <div class="cta-section__container animate-on-scroll scale-in">
      <AppHeading :level="2" align="center" class="cta-section__title">
        {{ title }}
      </AppHeading>
      <AppText v-if="subtitle" size="lg" align="center" class="cta-section__subtitle">
        {{ subtitle }}
      </AppText>
      <AppButton variant="primary" :to="localePath(ctaTo)" size="lg" class="cta-section__button">
        {{ ctaLabel }}
      </AppButton>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  padding: var(--space-20) var(--space-6);
}

.cta-section__container {
  max-width: var(--max-width-narrow);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}

.cta-section__title {
  color: var(--color-text-inverse);
}

.cta-section__subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.cta-section__button {
  margin-top: var(--space-4);
}
</style>
