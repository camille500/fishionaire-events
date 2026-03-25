<script setup>
const tour = useTour()

const { isActive, currentStepData, currentStep, totalSteps, targetRect } = tour

const { t } = useI18n()

const spotlightStyle = computed(() => {
  if (!targetRect.value) return null

  const rect = targetRect.value
  const padding = currentStepData.value?.spotlightPadding ?? 8

  return {
    position: 'fixed',
    top: `${rect.top - padding}px`,
    left: `${rect.left - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`,
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
    pointerEvents: 'none',
    transition: 'all 300ms ease',
  }
})

function handleKeydown(e) {
  if (!isActive.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    tour.skipAll()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    tour.nextStep()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    tour.prevStep()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="tour-overlay">
        <div v-if="isActive" class="tour-overlay">
          <!-- Backdrop click to dismiss -->
          <div class="tour-overlay__backdrop" @click="tour.skipAll()" />

          <!-- Spotlight cutout -->
          <div v-if="spotlightStyle" :style="spotlightStyle" class="tour-overlay__spotlight" />

          <!-- Tooltip card -->
          <div class="tour-overlay__card-wrapper">
            <TourSpotlight
              v-if="currentStepData"
              :title="t(currentStepData.title)"
              :description="t(currentStepData.description)"
              :current-step="currentStep"
              :total-steps="totalSteps"
              :position="currentStepData.position"
              :target-rect="targetRect"
              @next="tour.nextStep()"
              @prev="tour.prevStep()"
              @skip="tour.skipStep()"
              @skip-all="tour.skipAll()"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
}

.tour-overlay__backdrop {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  z-index: 9998;
}

.tour-overlay__spotlight {
  pointer-events: none;
}

.tour-overlay__card-wrapper {
  position: relative;
  z-index: 10002;
  pointer-events: auto;
}

/* Transition */
.tour-overlay-enter-active {
  transition: opacity 300ms ease-out;
}

.tour-overlay-leave-active {
  transition: opacity 200ms ease-in;
}

.tour-overlay-enter-from,
.tour-overlay-leave-to {
  opacity: 0;
}
</style>
