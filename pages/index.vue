<script setup>
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('seo.home.title'),
  ogTitle: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
  ogDescription: () => t('seo.home.description'),
})

useHead({ title: () => t('seo.home.title') })

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
      <AppButton variant="gradient" :to="localePath('/sign-up')" size="lg" class="btn-magnetic">
        {{ t('cta.home.button') }}
      </AppButton>
      <AppButton variant="outline" :to="localePath('features')" size="lg" class="hero-outline-btn">
        {{ t('nav.features') }}
      </AppButton>
    </HeroSection>

    <FeaturesStrip />

    <GlowSeparator />

    <section class="page-section">
      <div class="page-section__inner">
        <div class="section-header reveal">
          <span class="section-label">{{ t('home.features.label') }}</span>
          <h2 class="section-title">
            {{ t('home.features.title') }}
          </h2>
        </div>
        <FeatureGrid :features="features" :columns="3" />
      </div>
    </section>

    <GlowSeparator />

    <section class="page-section page-section--accent">
      <div class="page-section__inner">
        <div class="section-header reveal">
          <span class="section-label">{{ t('home.showcasesLabel') }}</span>
          <h2 class="section-title">
            {{ t('home.showcasesTitle') }}
          </h2>
        </div>
        <FeatureShowcase
          v-for="(showcase, index) in showcases"
          :key="index"
          :title="showcase.title"
          :description="showcase.description"
          :icon="showcase.icon"
          :reversed="index % 2 !== 0"
          class="showcase-item reveal"
        />
      </div>
    </section>

    <GlowSeparator />

    <section class="page-section">
      <div class="page-section__inner">
        <div class="section-header reveal">
          <span class="section-label">{{ t('home.testimonialsLabel') }}</span>
          <h2 class="section-title">
            {{ t('home.testimonialsTitle') }}
          </h2>
        </div>
        <TestimonialSlider :testimonials="testimonials" />
      </div>
    </section>

    <GlowSeparator />

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
  padding: 120px 0;
  position: relative;
}

.page-section--accent {
  background: linear-gradient(180deg, transparent, var(--bg-surface), transparent);
}

.page-section__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  margin-bottom: 12px;
}

.section-title {
  font-size: clamp(1.9rem, 3.8vw, 2.6rem);
  letter-spacing: -0.03em;
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.2;
}

.showcase-item {
  padding: 64px 0;
}

.showcase-item:first-child {
  padding-top: 0;
}

.showcase-item:last-child {
  padding-bottom: 0;
}

.hero-outline-btn {
  color: var(--text-primary) !important;
  border-color: var(--color-border) !important;
}

.hero-outline-btn:hover {
  border-color: var(--color-accent) !important;
  background: var(--color-accent-bg) !important;
  color: var(--color-accent) !important;
}

@media (max-width: 768px) {
  .page-section {
    padding: 80px 0;
  }

  .section-header {
    margin-bottom: 40px;
  }

  .showcase-item {
    padding: 40px 0;
  }
}
</style>
