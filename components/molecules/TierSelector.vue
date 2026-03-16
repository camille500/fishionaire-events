<script setup>
const { t, tm, rt } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: 'free',
  },
  subscriptionTier: {
    type: String,
    default: 'free',
  },
  minTier: {
    type: String,
    default: null,
  },
  paymentMode: {
    type: String,
    default: 'event',
  },
})

const emit = defineEmits(['update:modelValue'])

const TIER_ORDER = { free: 0, standard: 1, pro: 2 }

const tiers = computed(() => {
  const tierKeys = ['free', 'standard', 'pro']
  return tierKeys.map((key) => {
    const features = tm(`tierSelector.tiers.${key}.features`).map((f) => rt(f))
    const isCovered = TIER_ORDER[props.subscriptionTier] >= TIER_ORDER[key]
    const disabled = props.minTier ? TIER_ORDER[key] <= TIER_ORDER[props.minTier] : false
    const priceKey = props.paymentMode === 'monthly'
      ? 'monthlyPrice'
      : props.paymentMode === 'yearly'
        ? 'yearlyPrice'
        : 'eventPrice'
    return {
      key,
      name: t(`tiers.${key}`),
      features,
      isCovered: key === 'free' || isCovered,
      price: key === 'free' ? null : t(`tierSelector.tiers.${key}.${priceKey}`),
      recommended: key === 'standard',
      disabled,
    }
  })
})

function select(tierKey) {
  const tier = tiers.value.find((t) => t.key === tierKey)
  if (tier?.disabled) return
  emit('update:modelValue', tierKey)
}
</script>

<template>
  <div class="tier-selector">
    <AppText size="sm" class="tier-selector__label">{{ t('tierSelector.label') }}</AppText>
    <div class="tier-selector__grid">
      <button
        v-for="tier in tiers"
        :key="tier.key"
        type="button"
        class="tier-option"
        :class="{
          'tier-option--selected': modelValue === tier.key,
          'tier-option--disabled': tier.disabled,
          [`tier-option--${tier.key}`]: true,
        }"
        :disabled="tier.disabled"
        @click="select(tier.key)"
      >
        <div class="tier-option__top-bar" />
        <div class="tier-option__body">
          <div class="tier-option__header">
            <div class="tier-option__name-row">
              <span class="tier-option__name">{{ tier.name }}</span>
              <span v-if="tier.disabled" class="tier-option__current">
                {{ t('tierSelector.currentTier') }}
              </span>
              <span v-else-if="tier.recommended" class="tier-option__recommended">
                {{ t('tierSelector.recommended') }}
              </span>
            </div>
            <Icon
              v-if="modelValue === tier.key"
              name="lucide:check"
              size="16"
              class="tier-option__check"
            />
          </div>

          <div v-if="tier.isCovered && tier.key !== 'free'" class="tier-option__included">
            <Icon name="lucide:check" size="16" />
            <span>{{ t('tierSelector.includedWithPlan') }}</span>
          </div>
          <div v-else-if="tier.price" class="tier-option__price">
            {{ tier.price }}
          </div>

          <ul class="tier-option__features">
            <li v-for="(feature, i) in tier.features" :key="i">
              <Icon name="lucide:check" size="16" />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tier-selector__label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  display: block;
}

.tier-selector__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .tier-selector__grid {
    grid-template-columns: 1fr;
  }
}

.tier-option {
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  overflow: hidden;
  padding: 0;
}

.tier-option:hover {
  border-color: var(--color-text-muted);
  box-shadow: var(--shadow-sm);
}

.tier-option--selected {
  border-color: var(--color-accent);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.15);
}

.tier-option__top-bar {
  height: 3px;
  background: transparent;
}

.tier-option--free .tier-option__top-bar {
  background: var(--color-background-alt);
}

.tier-option--standard .tier-option__top-bar {
  background: linear-gradient(90deg, #1a73e8, #4a9ff5);
}

.tier-option--pro .tier-option__top-bar {
  background: linear-gradient(90deg, #e8760a, #f5a623);
}

.tier-option__body {
  padding: var(--space-4);
}

.tier-option__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.tier-option__name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.tier-option__name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.tier-option__recommended {
  font-size: 0.625rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #e8f4fd;
  color: #1a73e8;
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
}

.tier-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.tier-option__current {
  font-size: 0.625rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-background-alt);
  color: var(--color-text-muted);
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
}

.tier-option__check {
  color: var(--color-accent);
  flex-shrink: 0;
}

.tier-option__included {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-3);
}

.tier-option__price {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.tier-option__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.tier-option__features li {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.tier-option__features :deep(svg) {
  color: var(--color-success);
  flex-shrink: 0;
}
</style>
