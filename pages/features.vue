<script setup>
const { t, tm, rt } = useI18n()

const featureItems = computed(() =>
  tm('features.items').map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    description: rt(item.description),
  }))
)
</script>

<template>
  <MarketingTemplate>
    <HeroSection
      :title="t('features.hero.title')"
      :subtitle="t('features.hero.subtitle')"
      small
    />

    <section class="features-page">
      <FeatureShowcase
        v-for="(feature, index) in featureItems"
        :key="index"
        :title="feature.title"
        :description="feature.description"
        :icon="feature.icon"
        :reversed="index % 2 !== 0"
        class="features-page__item"
        :class="index % 2 === 0 ? 'features-page__item--light' : 'features-page__item--white'"
      />
    </section>

    <CTASection
      :title="t('cta.features.title')"
      :subtitle="t('cta.features.subtitle')"
      :cta-label="t('cta.features.button')"
      cta-to="/sign-up"
    />
  </MarketingTemplate>
</template>

<style scoped>
.features-page__item {
  padding: var(--space-16) 0;
}

.features-page__item--white {
  background: var(--color-surface);
}

.features-page__item--light {
  background: var(--color-background);
}
</style>
