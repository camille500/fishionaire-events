<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  features: {
    type: Array,
    required: true,
  },
  highlighted: {
    type: Boolean,
    default: false,
  },
  ctaLabel: {
    type: String,
    required: true,
  },
  ctaTo: {
    type: String,
    default: '/sign-up',
  },
  perEventPrice: {
    type: String,
    default: '',
  },
  tier: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="pricing-card" :class="{ 'pricing-card--highlighted': highlighted }">
    <AppBadge v-if="highlighted" label="Populair" variant="accent" class="pricing-card__badge" />
    <AppHeading :level="3" class="pricing-card__name">{{ name }}</AppHeading>
    <div class="pricing-card__price">
      <span class="pricing-card__amount">{{ price }}</span>
      <span class="pricing-card__period">{{ period }}</span>
    </div>
    <div v-if="perEventPrice" class="pricing-card__per-event">
      {{ perEventPrice }}
    </div>
    <ul class="pricing-card__features">
      <li v-for="(feature, index) in features" :key="index" class="pricing-card__feature">
        <AppIcon name="check" size="sm" />
        <span>{{ feature }}</span>
      </li>
    </ul>
    <AppButton
      :variant="highlighted ? 'primary' : 'outline'"
      :to="tier ? undefined : ctaTo"
      size="md"
      class="pricing-card__cta"
      @click="tier ? emit('select', tier) : undefined"
    >
      {{ ctaLabel }}
    </AppButton>
  </div>
</template>

<style scoped>
.pricing-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all var(--transition-base);
}

.pricing-card--highlighted {
  border-color: var(--color-accent);
  border-width: 2px;
  transform: scale(1.03);
  box-shadow: var(--shadow-lg);
}

.pricing-card__badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.pricing-card__name {
  font-size: var(--text-xl);
  margin-bottom: var(--space-4);
}

.pricing-card__price {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
}

.pricing-card__amount {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.pricing-card__period {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.pricing-card__per-event {
  display: inline-block;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-background-alt);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  margin-top: calc(-1 * var(--space-3));
  margin-bottom: var(--space-4);
}

.pricing-card__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
  flex: 1;
}

.pricing-card__feature {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.pricing-card__feature .app-icon {
  color: var(--color-success);
}

.pricing-card__cta {
  width: 100%;
}
</style>
