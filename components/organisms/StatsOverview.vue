<script setup>
defineProps({
  stats: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="stats-overview">
    <StatCard
      v-for="(stat, index) in stats"
      :key="stat.label"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: index * 80 } }"
      :icon="stat.icon"
      :label="stat.label"
      :value="stat.value"
      :color="stat.color"
    />
  </div>
</template>

<style scoped>
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style>
