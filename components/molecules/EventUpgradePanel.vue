<script setup>
const { t } = useI18n()
const route = useRoute()
const { eventData } = useEventEditor()
const { tier: subscriptionTier, upgradeEvent, checkout } = useSubscription()

const emit = defineEmits(['close', 'upgraded'])

const selectedTier = ref(null)
const paymentMode = ref('event')
const upgrading = ref(false)
const upgradeError = ref('')

const TIER_ORDER = { free: 0, standard: 1, pro: 2 }
const selectedTierIsCovered = computed(() => {
  if (!selectedTier.value) return false
  return TIER_ORDER[subscriptionTier.value] >= TIER_ORDER[selectedTier.value]
})

async function handleUpgrade() {
  if (!selectedTier.value) return
  upgrading.value = true
  upgradeError.value = ''
  try {
    if (selectedTierIsCovered.value) {
      const result = await $fetch(`/api/events/${route.params.id}/tier`, {
        method: 'PUT',
        body: { tier: selectedTier.value },
      })
      eventData.value.tier = result.tier
      eventData.value.features = result.features
      emit('upgraded')
      emit('close')
    } else if (paymentMode.value === 'event') {
      await upgradeEvent(String(route.params.id), selectedTier.value)
    } else {
      const interval = paymentMode.value === 'yearly' ? 'yearly' : 'monthly'
      await checkout(selectedTier.value, interval, route.params.id)
    }
  } catch (e) {
    upgradeError.value = e.data?.statusMessage || t('editor.settings.upgradeError')
  } finally {
    upgrading.value = false
  }
}
</script>

<template>
  <div class="upgrade-panel">
    <div class="upgrade-panel__header">
      <span class="upgrade-panel__title">{{ t('editor.settings.upgradeTier') }}</span>
      <button type="button" class="upgrade-panel__close" @click="emit('close')">
        <Icon name="lucide:x" size="16" />
      </button>
    </div>

    <div class="upgrade-panel__payment-modes">
      <span class="upgrade-panel__label">{{ t('editor.settings.paymentMode') }}</span>
      <div class="upgrade-panel__pills">
        <button
          type="button"
          class="upgrade-panel__pill"
          :class="{ 'upgrade-panel__pill--active': paymentMode === 'event' }"
          @click="paymentMode = 'event'"
        >
          {{ t('editor.settings.paymentEvent') }}
        </button>
        <button
          type="button"
          class="upgrade-panel__pill"
          :class="{ 'upgrade-panel__pill--active': paymentMode === 'monthly' }"
          @click="paymentMode = 'monthly'"
        >
          {{ t('editor.settings.paymentMonthly') }}
        </button>
        <button
          type="button"
          class="upgrade-panel__pill"
          :class="{ 'upgrade-panel__pill--active': paymentMode === 'yearly' }"
          @click="paymentMode = 'yearly'"
        >
          {{ t('editor.settings.paymentYearly') }}
          <span class="upgrade-panel__save-badge">{{ t('editor.settings.paymentYearlySave') }}</span>
        </button>
      </div>
      <AppText v-if="paymentMode === 'monthly' || paymentMode === 'yearly'" size="xs" muted>
        {{ t('editor.settings.subscriptionHint') }}
      </AppText>
    </div>

    <TierSelector
      v-model="selectedTier"
      :subscription-tier="subscriptionTier"
      :min-tier="eventData?.tier || 'free'"
      :payment-mode="paymentMode"
    />

    <div v-if="selectedTier" class="upgrade-panel__actions">
      <span v-if="selectedTierIsCovered" class="upgrade-panel__covered">
        <Icon name="lucide:check" size="14" />
        {{ t('editor.settings.coveredByPlan') }}
      </span>
      <AppButton
        variant="primary"
        :disabled="upgrading"
        @click="handleUpgrade"
      >
        {{ upgrading ? t('editor.settings.upgrading') : t('editor.settings.confirmUpgrade', { tier: t(`tiers.${selectedTier}`) }) }}
      </AppButton>
    </div>

    <AppText v-if="upgradeError" size="sm" class="upgrade-panel__error">
      {{ upgradeError }}
    </AppText>

    <button type="button" class="upgrade-panel__cancel" @click="emit('close')">
      {{ t('editor.settings.cancel') }}
    </button>
  </div>
</template>

<style scoped>
.upgrade-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.upgrade-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upgrade-panel__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.upgrade-panel__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.upgrade-panel__close:hover {
  background: var(--color-surface);
  color: var(--color-text-secondary);
}

.upgrade-panel__payment-modes {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.upgrade-panel__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.upgrade-panel__pills {
  display: flex;
  gap: var(--space-2);
}

.upgrade-panel__pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.upgrade-panel__pill:hover {
  border-color: var(--color-accent-light);
  color: var(--color-accent);
}

.upgrade-panel__pill--active {
  border-color: var(--color-accent);
  background: var(--color-accent-bg);
  color: var(--color-accent);
}

.upgrade-panel__save-badge {
  font-size: 0.625rem;
  font-weight: var(--font-weight-semibold);
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  color: var(--color-success);
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
}

.upgrade-panel__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.upgrade-panel__covered {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.upgrade-panel__error {
  color: var(--color-error);
}

.upgrade-panel__cancel {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: 0;
  font-family: var(--font-family);
  text-align: left;
  width: fit-content;
}

.upgrade-panel__cancel:hover {
  color: var(--color-text-secondary);
}
</style>
