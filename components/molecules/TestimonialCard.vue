<script setup>
defineProps({
  quote: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="testimonial-card">
    <div class="testimonial-card__stars">
      <AppIcon v-for="i in 5" :key="i" name="star" size="sm" />
    </div>
    <AppText class="testimonial-card__quote">"{{ quote }}"</AppText>
    <div class="testimonial-card__author">
      <span class="testimonial-card__name">{{ author }}</span>
      <span class="testimonial-card__role">{{ role }}</span>
    </div>
  </div>
</template>

<style scoped>
.testimonial-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  min-width: 320px;
  max-width: 400px;
  flex-shrink: 0;
}

.testimonial-card__stars {
  display: flex;
  gap: var(--space-1);
  color: var(--color-accent);
  margin-bottom: var(--space-4);
}

.testimonial-card__quote {
  font-style: italic;
  margin-bottom: var(--space-4);
  line-height: var(--line-height-relaxed);
}

.testimonial-card__author {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.testimonial-card__name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
}

.testimonial-card__role {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
