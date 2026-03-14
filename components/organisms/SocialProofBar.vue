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
        class="social-proof-bar__item reveal"
      >
        <StatBlock
          :value="stat.value"
          :label="stat.label"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.social-proof-bar {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-12) 0;
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

.social-proof-bar__item {
  position: relative;
}

.social-proof-bar__item + .social-proof-bar__item::before {
  content: '';
  position: absolute;
  left: calc(-1 * var(--space-8));
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

@media (max-width: 640px) {
  .social-proof-bar__container {
    gap: var(--space-6);
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .social-proof-bar__item + .social-proof-bar__item::before {
    display: none;
  }
}
</style>
