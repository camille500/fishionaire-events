<script setup>
defineProps({
  categories: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="help-category-grid">
    <div class="help-category-grid__container">
      <div class="help-category-grid__items">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="help-category-grid__card animate-on-scroll slide-up"
          :class="`stagger-${index + 1}`"
        >
          <div class="help-category-grid__icon">
            <AppIcon :name="category.icon" size="lg" />
          </div>
          <AppHeading :level="3" class="help-category-grid__title">
            {{ category.title }}
          </AppHeading>
          <AppText size="sm">{{ category.description }}</AppText>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.help-category-grid__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.help-category-grid__items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.help-category-grid__card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  text-align: center;
  transition: all var(--transition-base);
  cursor: pointer;
}

.help-category-grid__card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

.help-category-grid__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-background);
  color: var(--color-accent);
  margin: 0 auto var(--space-4);
}

.help-category-grid__title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
}

@media (max-width: 768px) {
  .help-category-grid__items {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .help-category-grid__items {
    grid-template-columns: 1fr;
  }
}
</style>
