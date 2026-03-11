<script setup>
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

useScrollReveal()

const stats = computed(() => [
  { value: t('home.stats.events'), label: t('home.stats.eventsLabel') },
  { value: t('home.stats.guests'), label: t('home.stats.guestsLabel') },
  { value: t('home.stats.rating'), label: t('home.stats.ratingLabel') },
])

const features = computed(() =>
  tm('home.features.items').map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    description: rt(item.description),
  }))
)

const showcases = computed(() =>
  tm('home.showcases').map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    description: rt(item.description),
  }))
)

const testimonials = computed(() =>
  tm('home.testimonials').map((item) => ({
    quote: rt(item.quote),
    author: rt(item.author),
    role: rt(item.role),
  }))
)
</script>

<template>
  <MarketingTemplate>
    <HeroSection
      :title="t('home.hero.title')"
      :subtitle="t('home.hero.subtitle')"
    >
      <AppButton variant="primary" :to="localePath('/sign-up')" size="lg">
        {{ t('cta.home.button') }}
      </AppButton>
      <AppButton variant="outline" :to="localePath('features')" size="lg" class="hero-outline-btn">
        {{ t('nav.features') }}
      </AppButton>
    </HeroSection>

    <SocialProofBar :stats="stats" />

    <section class="page-section">
      <AppHeading :level="2" align="center" class="section-title">
        {{ t('home.features.title') }}
      </AppHeading>
      <FeatureGrid :features="features" :columns="3" />
    </section>

    <section class="page-section page-section--alt">
      <FeatureShowcase
        v-for="(showcase, index) in showcases"
        :key="index"
        :title="showcase.title"
        :description="showcase.description"
        :icon="showcase.icon"
        :reversed="index % 2 !== 0"
        class="showcase-item"
      />
    </section>

    <section class="page-section">
      <TestimonialSlider :testimonials="testimonials" />
    </section>

    <CTASection
      :title="t('cta.home.title')"
      :subtitle="t('cta.home.subtitle')"
      :cta-label="t('cta.home.button')"
      cta-to="/sign-up"
    />
  </MarketingTemplate>
</template>

<style scoped>
.page-section {
  padding: var(--space-20) 0;
}

.page-section--alt {
  background: var(--color-surface);
}

.section-title {
  margin-bottom: var(--space-12);
}

.showcase-item {
  padding: var(--space-12) 0;
}

.hero-outline-btn {
  color: var(--color-text-inverse);
  border-color: rgba(255, 255, 255, 0.4);
}

.hero-outline-btn:hover {
  border-color: var(--color-text-inverse);
  background: rgba(255, 255, 255, 0.1);
}
</style>
