<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const toast = useToast()

const {
  form,
  currentStep,
  direction,
  stepItems,
  canProceed,
  hasPrev,
  hasNext,
  isLastStep,
  currentStepId,
  completionPercentage,
  next,
  prev,
  goToStep,
  startMode,
  hasDraft,
  resumeDraft,
  clearDraft,
  resetWizard,
  getSubmissionData,
} = useWizardStateProvider()

const wizardAi = useWizardAi()

// Draft resume on mount
const draftChecked = ref(false)
onMounted(() => {
  if (hasDraft.value) {
    toast.add({
      title: t('wizard.draft.title'),
      description: t('wizard.draft.description'),
      actions: [
        {
          label: t('wizard.draft.resume'),
          click: () => {
            resumeDraft()
            draftChecked.value = true
          },
        },
        {
          label: t('wizard.draft.startFresh'),
          variant: 'ghost',
          click: () => {
            clearDraft()
            draftChecked.value = true
          },
        },
      ],
      duration: 10000,
    })
  }
  draftChecked.value = true
})

// Event creation
const creating = ref(false)
const created = ref(false)
const createdEvent = ref(null)
const createError = ref('')

async function createEvent() {
  if (!form.title.trim()) return

  creating.value = true
  createError.value = ''

  try {
    const body = getSubmissionData()
    const result = await $fetch('/api/events', {
      method: 'POST',
      body,
    })

    createdEvent.value = result
    created.value = true
    clearDraft()

    // If requires payment, redirect to Stripe
    if (result.requiresPayment) {
      const { upgradeEvent } = useSubscription()
      await upgradeEvent(result.id, form.selectedTier)
      return
    }
  } catch (e) {
    createError.value = e.data?.statusMessage || t('dashboard.errorCreating')
  } finally {
    creating.value = false
  }
}

// Transition name based on direction
const transitionName = computed(() => {
  return direction.value > 0 ? 'wizard-slide-forward' : 'wizard-slide-backward'
})
</script>

<template>
  <div class="create-page">
    <!-- Mobile progress bar -->
    <WizardProgressBar
      :steps="stepItems"
      :current-step="currentStep"
      :percentage="completionPercentage"
      class="create-page__mobile-progress"
    />

    <div class="create-page__layout">
      <!-- Desktop sidebar progress -->
      <WizardProgressSidebar
        :steps="stepItems"
        :current-step="currentStep"
        class="create-page__sidebar"
        @go-to-step="goToStep"
      />

      <!-- Main content area -->
      <div class="create-page__main">
        <div class="create-page__content">
          <Transition :name="transitionName" mode="out-in">
            <!-- Step 0: Start -->
            <WizardStepStart
              v-if="currentStepId === 'start'"
              key="start"
              :wizard-ai="wizardAi"
              @manual="startMode = 'manual'; next()"
              @ai-complete="next()"
            />

            <!-- Step 1: Event Type -->
            <WizardStepType
              v-else-if="currentStepId === 'type'"
              key="type"
              @selected="next()"
            />

            <!-- Step 2: Basic Info -->
            <WizardStepInfo
              v-else-if="currentStepId === 'info'"
              key="info"
              :wizard-ai="wizardAi"
            />

            <!-- Step 3: Activities -->
            <WizardStepActivities
              v-else-if="currentStepId === 'activities'"
              key="activities"
              :wizard-ai="wizardAi"
            />

            <!-- Step 4: Tier -->
            <WizardStepTier
              v-else-if="currentStepId === 'tier'"
              key="tier"
              :wizard-ai="wizardAi"
            />

            <!-- Step 5: Review -->
            <WizardStepReview
              v-else-if="currentStepId === 'review'"
              key="review"
              :creating="creating"
              :created="created"
              :created-event="createdEvent"
              :error="createError"
              @create="createEvent"
              @go-to-step="goToStep"
            />
          </Transition>
        </div>

        <!-- Navigation bar -->
        <div v-if="!created" class="create-page__nav">
          <AppButton
            v-if="hasPrev"
            variant="ghost"
            size="sm"
            @click="prev()"
          >
            <Icon name="lucide:arrow-left" size="14" />
            {{ t('wizard.prev') }}
          </AppButton>
          <div v-else />

          <AppButton
            v-if="hasNext && currentStepId !== 'start'"
            variant="primary"
            size="sm"
            :disabled="!canProceed"
            @click="next()"
          >
            {{ t('wizard.next') }}
            <Icon name="lucide:arrow-right" size="14" />
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  margin: calc(-1 * var(--space-8));
}

.create-page__mobile-progress {
  display: none;
}

.create-page__layout {
  display: flex;
  flex: 1;
}

.create-page__sidebar {
  flex-shrink: 0;
}

.create-page__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.create-page__content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--space-8);
  overflow-y: auto;
}

.create-page__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-8);
  border-top: 1px solid var(--color-border-light);
  background: color-mix(in srgb, var(--color-background) 80%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/* Step transitions */
.wizard-slide-forward-enter-active,
.wizard-slide-forward-leave-active,
.wizard-slide-backward-enter-active,
.wizard-slide-backward-leave-active {
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.wizard-slide-forward-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.wizard-slide-forward-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.wizard-slide-backward-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.wizard-slide-backward-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@media (max-width: 768px) {
  .create-page {
    margin: calc(-1 * var(--space-4));
  }

  .create-page__mobile-progress {
    display: block;
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border-light);
  }

  .create-page__sidebar {
    display: none;
  }

  .create-page__content {
    padding: var(--space-4);
  }

  .create-page__nav {
    padding: var(--space-3) var(--space-4);
    padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
