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
  <div class="testimonial-card glass">
    <div class="testimonial-card__quote-mark" aria-hidden="true">"</div>
    <div class="testimonial-card__stars">
      <Icon v-for="i in 5" :key="i" name="lucide:star" size="16" />
    </div>
    <AppText class="testimonial-card__quote">"{{ quote }}"</AppText>
    <div class="testimonial-card__author">
      <div class="testimonial-card__avatar">
        {{ author.charAt(0) }}
      </div>
      <div>
        <span class="testimonial-card__name">{{ author }}</span>
        <span class="testimonial-card__role">{{ role }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.testimonial-card {
  padding: var(--space-8);
  min-width: 320px;
  max-width: 400px;
  flex-shrink: 0;
  transition: border-color 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.testimonial-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 184, 148, 0.15);
}

.testimonial-card__quote-mark {
  position: absolute;
  top: var(--space-4);
  right: var(--space-6);
  font-family: var(--font-family-heading);
  font-size: 5rem;
  line-height: 1;
  color: var(--color-accent);
  opacity: 0.08;
  pointer-events: none;
}

.testimonial-card__stars {
  display: flex;
  gap: var(--space-1);
  color: #fbbf24;
  margin-bottom: var(--space-4);
}

.testimonial-card__quote {
  font-style: italic;
  margin-bottom: var(--space-6);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.testimonial-card__author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.testimonial-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-accent);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.testimonial-card__name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  display: block;
}

.testimonial-card__role {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
