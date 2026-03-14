<script setup>
const { t } = useI18n()
const { form, selectType, EVENT_TYPES } = useWizardState()

const emit = defineEmits(['selected'])

const selectedAnimating = ref('')

function onSelectType(type) {
  selectType(type)
  selectedAnimating.value = type

  // Auto-advance after animation
  setTimeout(() => {
    emit('selected')
  }, 400)
}
</script>

<template>
  <div class="step-type">
    <div class="step-type__header">
      <AppHeading :level="2" size="xl">{{ t('wizard.steps.typeTitle') }}</AppHeading>
      <AppText size="sm" muted>{{ t('wizard.steps.typeSubtitle') }}</AppText>
    </div>

    <div class="step-type__grid">
      <EventTypeCard
        v-for="(type, index) in EVENT_TYPES"
        :key="type"
        :event-type="type"
        :selected="form.selectedType === type"
        :class="{
          'step-type__card--dimmed': form.selectedType && form.selectedType !== type,
          'step-type__card--animating': selectedAnimating === type,
        }"
        :style="{ animationDelay: `${index * 60}ms` }"
        class="step-type__card"
        @select="onSelectType"
      />
    </div>
  </div>
</template>

<style scoped>
.step-type {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.step-type__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.step-type__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.step-type__card {
  animation: stagger-in 400ms ease-out both;
}

.step-type__card--dimmed {
  opacity: 0.5;
  transform: scale(0.97);
  transition: all var(--transition-base);
}

.step-type__card--animating {
  animation: card-select 400ms ease-out;
}

@keyframes stagger-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes card-select {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@media (max-width: 640px) {
  .step-type__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
