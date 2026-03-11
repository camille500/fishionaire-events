<script setup>
const { t, tm, rt } = useI18n()
const { isSignedIn } = useAuth()
const { checkout } = useSubscription()

useScrollReveal()

const subscribing = ref(false)

const plans = computed(() =>
  tm('pricing.plans').map((plan) => ({
    name: rt(plan.name),
    price: rt(plan.price),
    period: rt(plan.period),
    ctaLabel: rt(plan.ctaLabel),
    highlighted: plan.highlighted,
    features: plan.features.map((f) => rt(f)),
    perEventPrice: plan.perEventPrice ? rt(plan.perEventPrice) : '',
    tier: plan.tier || '',
  }))
)

const faqItems = computed(() =>
  tm('pricing.faq.items').map((item) => ({
    question: rt(item.question),
    answer: rt(item.answer),
  }))
)

async function onPlanSelect(tier) {
  if (!isSignedIn.value) {
    navigateTo('/sign-up')
    return
  }

  subscribing.value = true
  try {
    await checkout(tier)
    navigateTo('/dashboard')
  } catch {
    // Phase 2: handle Stripe redirect
  } finally {
    subscribing.value = false
  }
}
</script>

<template>
  <MarketingTemplate>
    <HeroSection
      :title="t('pricing.hero.title')"
      :subtitle="t('pricing.hero.subtitle')"
      small
    />

    <section class="pricing-page__plans">
      <PricingTable :plans="plans" @select="onPlanSelect" />
    </section>

    <section class="pricing-page__faq">
      <div class="pricing-page__faq-container">
        <AppHeading :level="2" align="center" class="pricing-page__faq-title">
          {{ t('pricing.faq.title') }}
        </AppHeading>
        <AccordionGroup :items="faqItems" />
      </div>
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
.pricing-page__plans {
  padding: var(--space-20) 0;
}

.pricing-page__faq {
  padding: var(--space-16) 0;
  background: var(--color-surface);
}

.pricing-page__faq-container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.pricing-page__faq-title {
  margin-bottom: var(--space-12);
}
</style>
