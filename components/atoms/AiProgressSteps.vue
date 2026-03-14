<script setup>
const { t, locale } = useI18n()

const steps = computed(() => {
  if (locale.value === 'nl') {
    return [
      { label: 'Je evenement begrijpen...', icon: 'lucide:brain' },
      { label: 'Details genereren...', icon: 'lucide:file-text' },
      { label: 'Activiteiten opbouwen...', icon: 'lucide:layers' },
    ]
  }
  return [
    { label: 'Understanding your event...', icon: 'lucide:brain' },
    { label: 'Generating details...', icon: 'lucide:file-text' },
    { label: 'Building activities...', icon: 'lucide:layers' },
  ]
})

const activeStep = ref(0)
let timer = null

onMounted(() => {
  // Advance through cosmetic steps to give sense of progress
  timer = setInterval(() => {
    if (activeStep.value < steps.value.length - 1) {
      activeStep.value++
    }
  }, 2000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="ai-progress">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="ai-progress__step"
      :class="{
        'ai-progress__step--active': index === activeStep,
        'ai-progress__step--done': index < activeStep,
        'ai-progress__step--pending': index > activeStep,
      }"
    >
      <div class="ai-progress__icon">
        <Icon
          v-if="index < activeStep"
          name="lucide:check"
          size="12"
        />
        <Icon
          v-else-if="index === activeStep"
          name="lucide:loader-2"
          size="12"
          class="ai-progress__spinner"
        />
        <span v-else class="ai-progress__dot" />
      </div>
      <span class="ai-progress__label">{{ step.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.ai-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-accent) 5%, transparent);
  border-radius: var(--radius-md);
}

.ai-progress__step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all var(--transition-base);
}

.ai-progress__step--pending {
  opacity: 0.3;
}

.ai-progress__step--done {
  opacity: 0.6;
}

.ai-progress__step--active {
  opacity: 1;
}

.ai-progress__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.ai-progress__step--done .ai-progress__icon {
  background: var(--color-accent);
  color: white;
}

.ai-progress__step--active .ai-progress__icon {
  color: var(--color-accent);
}

.ai-progress__spinner {
  animation: spin 1s linear infinite;
}

.ai-progress__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-text-muted);
}

.ai-progress__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.ai-progress__step--pending .ai-progress__label {
  color: var(--color-text-muted);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
