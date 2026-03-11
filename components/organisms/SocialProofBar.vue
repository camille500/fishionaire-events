<script setup>
defineProps({
  stats: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="social-proof-bar">
    <div class="social-proof-bar__container">
      <StatBlock
        v-for="(stat, index) in stats"
        :key="index"
        :value="stat.value"
        :label="stat.label"
      />
    </div>
  </section>
</template>

<style scoped>
.social-proof-bar {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-8) 0;
}

.social-proof-bar__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  justify-content: center;
  gap: var(--space-16);
}

@media (max-width: 640px) {
  .social-proof-bar__container {
    gap: var(--space-6);
    flex-wrap: wrap;
  }
}
</style>
