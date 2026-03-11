<script setup>
const { t } = useI18n()

defineProps({
  subscription: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['manage', 'upgrade'])
</script>

<template>
  <div class="subscription-card" :class="`subscription-card--${subscription.tier}`">
    <div class="subscription-card__accent" />
    <div class="subscription-card__content">
      <div class="subscription-card__info">
        <div class="subscription-card__label-row">
          <AppIcon name="star" size="sm" class="subscription-card__icon" />
          <AppText size="sm" class="subscription-card__label">{{ t('billing.currentPlan') }}</AppText>
        </div>
        <div class="subscription-card__plan">
          <AppHeading :level="3" class="subscription-card__tier">{{ t(`tiers.${subscription.tier}`) }}</AppHeading>
          <TierBadge :tier="subscription.tier" />
        </div>
        <AppText v-if="subscription.tier === 'free'" size="sm" class="subscription-card__upsell">
          {{ t('billing.upsell') }}
        </AppText>
        <AppText v-else size="sm" class="subscription-card__price">
          {{ t(`billing.prices.${subscription.tier}`) }}
        </AppText>
      </div>
      <div class="subscription-card__actions">
        <AppButton
          v-if="subscription.tier === 'free'"
          variant="primary"
          size="sm"
          @click="emit('upgrade')"
        >
          <AppIcon name="zap" size="sm" />
          {{ t('billing.upgrade') }}
        </AppButton>
        <AppButton
          v-else
          variant="outline"
          size="sm"
          @click="emit('manage')"
        >
          {{ t('billing.managePlan') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscription-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-base);
}

.subscription-card:hover {
  box-shadow: var(--shadow-md);
}

.subscription-card__accent {
  height: 3px;
  background: var(--color-background-alt);
}

.subscription-card--standard .subscription-card__accent {
  background: linear-gradient(90deg, #1a73e8, #4a9ff5);
}

.subscription-card--pro .subscription-card__accent {
  background: linear-gradient(90deg, #e8760a, #f5a623);
}

.subscription-card--free .subscription-card__accent {
  background: var(--color-accent-light);
}

.subscription-card__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
}

.subscription-card__label-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.subscription-card__icon {
  color: var(--color-text-muted);
}

.subscription-card__label {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.subscription-card__plan {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.subscription-card__tier {
  font-size: var(--text-lg);
  margin: 0;
}

.subscription-card__upsell {
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
  margin-top: var(--space-1);
}

.subscription-card__price {
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

@media (max-width: 768px) {
  .subscription-card__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .subscription-card__actions {
    width: 100%;
  }

  .subscription-card__actions .app-button {
    width: 100%;
  }
}
</style>
