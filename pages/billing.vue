<script setup>
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { subscription, tier, isFree, cancelAtPeriodEnd, currentPeriodEnd, checkout, cancel, refresh } = useSubscription()

const loading = ref(false)
const showSuccess = ref(false)

const formattedPeriodEnd = computed(() => {
  if (!currentPeriodEnd.value) return ''
  return new Date(currentPeriodEnd.value).toLocaleDateString()
})

const planOptions = computed(() => {
  return ['free', 'standard', 'pro'].map((key) => ({
    key,
    name: t(`tiers.${key}`),
    price: t(`billing.prices.${key}`),
    description: t(`billing.planDescription.${key}`),
    isCurrent: tier.value === key,
    icon: key === 'free' ? 'calendar' : key === 'standard' ? 'star' : 'zap',
  }))
})

onMounted(async () => {
  if (route.query.session_id) {
    await $fetch('/api/subscriptions/verify-session', {
      method: 'POST',
      body: { sessionId: route.query.session_id },
    })
    await refresh()
    showSuccess.value = true
  }
})

async function onChangePlan(newTier) {
  loading.value = true
  try {
    await checkout(newTier)
    // User is redirected to Stripe Checkout
  } catch {
    loading.value = false
  }
}

async function onManageSubscription() {
  loading.value = true
  try {
    await cancel()
    // User is redirected to Stripe Customer Portal
  } catch {
    loading.value = false
  }
}
</script>

<template>
  <DefaultTemplate>
    <div class="billing">
      <div class="billing__top-nav">
        <AppButton variant="ghost" size="sm" :to="localePath('dashboard')">
          <Icon name="lucide:arrow-left" size="16" />
          {{ t('billing.backToDashboard') }}
        </AppButton>
      </div>

      <div class="billing__header">
        <AppHeading :level="1">{{ t('billing.title') }}</AppHeading>
        <AppText class="billing__subtitle">{{ t('billing.subtitle') }}</AppText>
      </div>

      <div v-if="showSuccess" class="billing__success">
        <Icon name="lucide:check-circle" size="18" />
        <AppText size="sm">{{ t('billing.subscriptionUpdated') }}</AppText>
      </div>

      <section class="billing__current-plan">
        <AppHeading :level="2" class="billing__section-title">{{ t('billing.currentPlan') }}</AppHeading>
        <div class="billing__plan-card" :class="`billing__plan-card--${tier}`">
          <div class="billing__plan-card-accent" />
          <div class="billing__plan-card-content">
            <div class="billing__plan-info">
              <div class="billing__plan-name">
                <AppHeading :level="3">{{ t(`tiers.${tier}`) }}</AppHeading>
                <TierBadge :tier="tier" />
              </div>
              <AppText size="sm" class="billing__plan-description">
                {{ t(`billing.planDescription.${tier}`) }}
              </AppText>
              <AppText v-if="!isFree" size="sm" class="billing__plan-price">
                {{ t(`billing.prices.${tier}`) }}
              </AppText>
              <AppText v-if="cancelAtPeriodEnd && formattedPeriodEnd" size="sm" class="billing__plan-cancel-notice">
                {{ t('billing.cancelsOn', { date: formattedPeriodEnd }) }}
              </AppText>
            </div>
            <div v-if="!isFree" class="billing__plan-actions">
              <AppButton
                variant="outline"
                size="sm"
                :disabled="loading"
                @click="onManageSubscription"
              >
                {{ t('billing.manageSubscription') }}
              </AppButton>
            </div>
          </div>
        </div>
      </section>

      <section class="billing__change-plan">
        <AppHeading :level="2" class="billing__section-title">{{ t('billing.changePlan') }}</AppHeading>
        <div class="billing__plan-options">
          <button
            v-for="option in planOptions"
            :key="option.key"
            class="billing__option"
            :class="{
              'billing__option--active': option.isCurrent,
              [`billing__option--${option.key}`]: true,
            }"
            :disabled="option.isCurrent || loading"
            @click="option.key === 'free' ? onManageSubscription() : onChangePlan(option.key)"
          >
            <div class="billing__option-top-bar" />
            <div class="billing__option-body">
              <div class="billing__option-header">
                <div class="billing__option-icon">
                  <Icon :name="'lucide:' + option.icon" size="16" />
                </div>
                <TierBadge v-if="option.isCurrent" :tier="option.key" />
              </div>
              <span class="billing__option-name">{{ option.name }}</span>
              <span class="billing__option-price">{{ option.price }}</span>
              <span class="billing__option-description">{{ option.description }}</span>
              <span v-if="option.isCurrent" class="billing__option-current">
                <Icon name="lucide:check" size="16" />
                {{ t('billing.currentLabel') }}
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  </DefaultTemplate>
</template>

<style scoped>
.billing__top-nav {
  margin-bottom: var(--space-4);
}

.billing__header {
  margin-bottom: var(--space-6);
}

.billing__subtitle {
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.billing__success {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-success-light, #eafaf1);
  border: 1px solid var(--color-success, #27ae60);
  border-radius: var(--radius-md);
  color: var(--color-success, #27ae60);
  margin-bottom: var(--space-6);
}

.billing__plan-cancel-notice {
  color: var(--color-warning, #e67e22);
  font-style: italic;
  margin-top: var(--space-1);
}

.billing__section-title {
  margin-bottom: var(--space-4);
}

.billing__current-plan {
  margin-bottom: var(--space-10);
}

.billing__plan-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.billing__plan-card-accent {
  height: 3px;
  background: var(--color-background-alt);
}

.billing__plan-card--standard .billing__plan-card-accent {
  background: linear-gradient(90deg, #1a73e8, #4a9ff5);
}

.billing__plan-card--pro .billing__plan-card-accent {
  background: linear-gradient(90deg, #e8760a, #f5a623);
}

.billing__plan-card--free .billing__plan-card-accent {
  background: var(--color-accent-light);
}

.billing__plan-card-content {
  padding: var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.billing__plan-name {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-1);
}

.billing__plan-name h3 {
  margin: 0;
}

.billing__plan-description {
  color: var(--color-text-muted);
}

.billing__plan-price {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  margin-top: var(--space-1);
}

.billing__confirm-cancel {
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-top: var(--space-3);
}

.billing__confirm-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.billing__change-plan {
  margin-bottom: var(--space-10);
}

.billing__plan-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .billing__plan-options {
    grid-template-columns: 1fr;
  }

  .billing__plan-card-content {
    flex-direction: column;
    align-items: flex-start;
  }
}

.billing__option {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  overflow: hidden;
  padding: 0;
}

.billing__option:hover:not(:disabled) {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}

.billing__option--active {
  border-color: var(--color-accent);
  background: var(--color-background);
}

.billing__option:disabled {
  cursor: default;
}

.billing__option-top-bar {
  height: 3px;
  background: transparent;
}

.billing__option--free .billing__option-top-bar {
  background: var(--color-background-alt);
}

.billing__option--standard .billing__option-top-bar {
  background: linear-gradient(90deg, #1a73e8, #4a9ff5);
}

.billing__option--pro .billing__option-top-bar {
  background: linear-gradient(90deg, #e8760a, #f5a623);
}

.billing__option-body {
  padding: var(--space-4) var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.billing__option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.billing__option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-secondary);
}

.billing__option--standard .billing__option-icon {
  background: #e8f4fd;
  color: #1a73e8;
}

.billing__option--pro .billing__option-icon {
  background: #fef3e2;
  color: #e8760a;
}

.billing__option-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.billing__option-price {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.billing__option-description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.billing__option-current {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
  margin-top: var(--space-1);
}
</style>
