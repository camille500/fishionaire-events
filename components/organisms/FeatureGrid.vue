<script setup>
defineProps({
  features: {
    type: Array,
    required: true,
  },
  columns: {
    type: Number,
    default: 3,
    validator: (v) => [2, 3].includes(v),
  },
})
</script>

<template>
  <section class="feature-grid">
    <div class="feature-grid__container">
      <div class="feature-grid__items" :class="`feature-grid__items--cols-${columns}`">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="animate-on-scroll slide-up"
          :class="`stagger-${(index % 6) + 1}`"
        >
          <FeatureCard
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-grid__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.feature-grid__items {
  display: grid;
  gap: var(--space-6);
}

.feature-grid__items--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.feature-grid__items--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1024px) {
  .feature-grid__items--cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .feature-grid__items--cols-2,
  .feature-grid__items--cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>
