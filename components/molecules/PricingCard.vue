<script setup>
const props = defineProps({
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

const cardRef = ref(null)
const tiltStyle = ref({})

function onMouseMove(e) {
  if (!props.highlighted || !cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  tiltStyle.value = {
    transform: `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale(1.03)`,
  }
}

function onMouseLeave() {
  tiltStyle.value = {}
}
</script>

<template>
  <div
    ref="cardRef"
    class="pricing-card"
    :class="{ 'pricing-card--highlighted': highlighted }"
    :style="tiltStyle"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
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
        <span class="pricing-card__check">
          <Icon name="lucide:check" size="14" />
        </span>
        <span>{{ feature }}</span>
      </li>
    </ul>
    <AppButton
      :variant="highlighted ? 'gradient' : 'outline'"
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
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 300ms ease;
  will-change: transform;
}

.pricing-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.pricing-card--highlighted {
  border: 2px solid transparent;
  background-image: linear-gradient(var(--color-surface), var(--color-surface)),
    var(--gradient-accent);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow: var(--shadow-accent);
}

.pricing-card__badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  animation: float 3s ease-in-out infinite;
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
  font-family: var(--font-family-heading);
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  line-height: 1;
  letter-spacing: var(--letter-spacing-tight);
}

.pricing-card--highlighted .pricing-card__amount {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.pricing-card__check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent-bg);
  color: var(--color-success);
  flex-shrink: 0;
}

.pricing-card__cta {
  width: 100%;
}
</style>
