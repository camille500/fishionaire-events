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
  <div class="feature-grid reveal-grid" :class="`feature-grid--cols-${columns}`">
    <FeatureCard
      v-for="(feature, index) in features"
      :key="index"
      :icon="feature.icon"
      :title="feature.title"
      :description="feature.description"
    />
  </div>
</template>

<style scoped>
.feature-grid {
  display: grid;
  gap: 20px;
}

.feature-grid--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.feature-grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 900px) {
  .feature-grid--cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .feature-grid--cols-2,
  .feature-grid--cols-3 {
    grid-template-columns: 1fr;
    max-width: 520px;
    margin: 0 auto;
  }
}
</style>
