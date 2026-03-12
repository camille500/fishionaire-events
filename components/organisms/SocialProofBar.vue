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
      <div
        v-for="(stat, index) in stats"
        :key="index"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{ opacity: 1, y: 0, transition: { delay: index * 150, duration: 500 } }"
      >
        <StatBlock
          :value="stat.value"
          :label="stat.label"
        />
      </div>
    </div>
    <div class="social-proof-bar__shine" />
  </section>
</template>

<style scoped>
.social-proof-bar {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-10) 0;
  position: relative;
  overflow: hidden;
}

.social-proof-bar__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  justify-content: center;
  gap: var(--space-16);
}

.social-proof-bar__shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: shine-sweep 4s ease-in-out infinite;
  pointer-events: none;
}

@media (max-width: 640px) {
  .social-proof-bar__container {
    gap: var(--space-6);
    flex-wrap: wrap;
  }
}
</style>
