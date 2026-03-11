<script setup>
defineProps({
  plans: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <section class="pricing-table">
    <div class="pricing-table__container">
      <div class="pricing-table__grid">
        <PricingCard
          v-for="(plan, index) in plans"
          :key="index"
          :name="plan.name"
          :price="plan.price"
          :period="plan.period"
          :features="plan.features"
          :highlighted="plan.highlighted || false"
          :cta-label="plan.ctaLabel"
          :per-event-price="plan.perEventPrice || ''"
          :tier="plan.tier || ''"
          class="animate-on-scroll slide-up"
          :class="`stagger-${index + 1}`"
          @select="emit('select', $event)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-table__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.pricing-table__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  align-items: start;
}

@media (max-width: 1024px) {
  .pricing-table__grid {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>
