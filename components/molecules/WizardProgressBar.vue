<script setup>
const { t } = useI18n()

const props = defineProps({
  steps: { type: Array, required: true },
  currentStep: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
})

const totalSteps = computed(() => props.steps.length)
const displayStep = computed(() => Math.min(props.currentStep + 1, totalSteps.value))
</script>

<template>
  <div class="wizard-progress-bar">
    <div class="wizard-progress-bar__track">
      <div
        class="wizard-progress-bar__fill"
        :style="{ width: `${percentage}%` }"
      />
    </div>
    <div class="wizard-progress-bar__info">
      <span class="wizard-progress-bar__step">
        {{ t('wizard.progress.stepOf', { current: displayStep, total: totalSteps }) }}
      </span>
      <span class="wizard-progress-bar__label">
        {{ steps[currentStep]?.title }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.wizard-progress-bar {
  padding: var(--space-3) var(--space-4);
}

.wizard-progress-bar__track {
  height: 3px;
  background: var(--color-border-light);
  border-radius: 2px;
  overflow: hidden;
}

.wizard-progress-bar__fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 2px;
  transition: width 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.wizard-progress-bar__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-2);
}

.wizard-progress-bar__step {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.wizard-progress-bar__label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
}
</style>
