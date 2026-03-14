<script setup>
const { t } = useI18n()
const { form } = useWizardState()
const { subscriptionTier } = useSubscription()

const props = defineProps({
  wizardAi: { type: Object, required: true },
})
</script>

<template>
  <div class="step-tier">
    <div class="step-tier__header">
      <AppHeading :level="2" size="xl">{{ t('wizard.steps.tierTitle') }}</AppHeading>
      <AppText size="sm" muted>{{ t('wizard.steps.tierSubtitle') }}</AppText>
    </div>

    <TierSelector
      v-model="form.selectedTier"
      :subscription-tier="subscriptionTier"
    />

    <!-- AI upsell if user used AI during wizard -->
    <Transition name="fade-in">
      <div v-if="wizardAi.showAiUpsell.value" class="step-tier__upsell">
        <Icon name="lucide:sparkles" size="14" class="step-tier__upsell-icon" />
        <AppText size="sm">
          {{ t('wizard.aiUpsellMessage') }}
        </AppText>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.step-tier {
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.step-tier__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.step-tier__upsell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
}

.step-tier__upsell-icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.fade-in-enter-active { transition: all 300ms ease-out; }
.fade-in-leave-active { transition: all 200ms ease-in; }
.fade-in-enter-from { opacity: 0; transform: translateY(8px); }
.fade-in-leave-to { opacity: 0; }
</style>
