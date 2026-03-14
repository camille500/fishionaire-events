<script setup>
const { t, tm, rt } = useI18n()

const categories = computed(() =>
  tm('help.categories').map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    description: rt(item.description),
  }))
)

const faqSections = computed(() => {
  const sections = ['general', 'rsvp', 'wishlists', 'planning', 'privacy']
  return sections.map((key) => ({
    title: t(`help.faq.${key}.title`),
    items: tm(`help.faq.${key}.items`).map((item) => ({
      question: rt(item.question),
      answer: rt(item.answer),
    })),
  }))
})
</script>

<template>
  <MarketingTemplate>
    <HeroSection
      :title="t('help.hero.title')"
      :subtitle="t('help.hero.subtitle')"
      small
    />

    <section class="help-page__categories">
      <HelpCategoryGrid :categories="categories" />
    </section>

    <section class="help-page__faq">
      <div class="help-page__faq-container">
        <div
          v-for="(section, index) in faqSections"
          :key="index"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :whileInView="{ opacity: 1, y: 0, transition: { delay: index * 0.1, duration: 0.5 } }"
          :inViewOptions="{ once: true }"
          class="help-page__faq-section"
        >
          <AppHeading :level="2" class="help-page__faq-section-title">
            {{ section.title }}
          </AppHeading>
          <AccordionGroup :items="section.items" />
        </div>
      </div>
    </section>

    <CTASection
      :title="t('cta.help.title')"
      :subtitle="t('cta.help.subtitle')"
      :cta-label="t('cta.help.button')"
      cta-to="/sign-up"
    />
  </MarketingTemplate>
</template>

<style scoped>
.help-page__categories {
  padding: var(--space-24) 0;
}

.help-page__faq {
  padding: var(--space-16) 0;
  background: var(--color-surface);
}

.help-page__faq-container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.help-page__faq-section {
  margin-bottom: var(--space-12);
}

.help-page__faq-section:last-child {
  margin-bottom: 0;
}

.help-page__faq-section-title {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-6);
}
</style>
