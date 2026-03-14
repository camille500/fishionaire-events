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
      class="stats-overview__fade-in"
      :style="{ animationDelay: `${index * 0.08}s` }"
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-overview__fade-in {
  animation: fadeInUp 0.4s ease both;
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
