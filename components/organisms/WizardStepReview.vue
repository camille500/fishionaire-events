<script setup>
const { t } = useI18n()
const { form, STEPS } = useWizardState()

const props = defineProps({
  creating: { type: Boolean, default: false },
  created: { type: Boolean, default: false },
  createdEvent: { type: Object, default: null },
  error: { type: String, default: '' },
})

const emit = defineEmits(['create', 'goToStep'])

const { icon: typeIcon } = useEventTheme(computed(() => form.selectedType || 'other'))

const activityCount = computed(() => form.subEvents.filter((se) => se.title.trim()).length)

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// Go to specific step for editing
function editField(stepId) {
  const index = STEPS.findIndex((s) => s.id === stepId)
  if (index >= 0) emit('goToStep', index)
}
</script>

<template>
  <div class="step-review">
    <!-- Pre-creation: Summary -->
    <template v-if="!created">
      <div class="step-review__header">
        <AppHeading :level="2" size="xl">{{ t('wizard.steps.reviewTitle') }}</AppHeading>
        <AppText size="sm" muted>{{ t('wizard.steps.reviewSubtitle') }}</AppText>
      </div>

      <div class="step-review__card">
        <!-- Type badge -->
        <div v-if="form.selectedType" class="step-review__type-bar" :data-event-type="form.selectedType">
          <Icon :name="typeIcon" size="16" />
          <span>{{ t(`wizard.eventTypes.${form.selectedType}.name`) }}</span>
          <button type="button" class="step-review__edit" @click="editField('type')">
            <Icon name="lucide:pencil" size="12" />
          </button>
        </div>

        <!-- Title -->
        <div class="step-review__row">
          <div class="step-review__row-content">
            <span class="step-review__row-label">{{ t('wizard.reviewFields.title') }}</span>
            <span class="step-review__row-value step-review__row-value--title">{{ form.title }}</span>
          </div>
          <button type="button" class="step-review__edit" @click="editField('info')">
            <Icon name="lucide:pencil" size="12" />
          </button>
        </div>

        <!-- Date -->
        <div v-if="form.eventDate" class="step-review__row">
          <div class="step-review__row-content">
            <span class="step-review__row-label">
              <Icon name="lucide:calendar" size="12" />
              {{ t('wizard.reviewFields.date') }}
            </span>
            <span class="step-review__row-value">{{ formatDate(form.eventDate) }}</span>
          </div>
          <button type="button" class="step-review__edit" @click="editField('info')">
            <Icon name="lucide:pencil" size="12" />
          </button>
        </div>

        <!-- Location -->
        <div v-if="form.location" class="step-review__row">
          <div class="step-review__row-content">
            <span class="step-review__row-label">
              <Icon name="lucide:map-pin" size="12" />
              {{ t('wizard.reviewFields.location') }}
            </span>
            <span class="step-review__row-value">{{ form.location }}</span>
          </div>
          <button type="button" class="step-review__edit" @click="editField('info')">
            <Icon name="lucide:pencil" size="12" />
          </button>
        </div>

        <!-- Activities -->
        <div class="step-review__row">
          <div class="step-review__row-content">
            <span class="step-review__row-label">
              <Icon name="lucide:layers" size="12" />
              {{ t('wizard.reviewFields.activities') }}
            </span>
            <span class="step-review__row-value">
              {{ activityCount > 0 ? t('wizard.reviewFields.activityCount', { count: activityCount }) : t('wizard.reviewFields.noActivities') }}
            </span>
          </div>
          <button type="button" class="step-review__edit" @click="editField('activities')">
            <Icon name="lucide:pencil" size="12" />
          </button>
        </div>

        <!-- Tier -->
        <div class="step-review__row">
          <div class="step-review__row-content">
            <span class="step-review__row-label">
              <Icon name="lucide:crown" size="12" />
              {{ t('wizard.reviewFields.plan') }}
            </span>
            <TierBadge :tier="form.selectedTier" />
          </div>
          <button type="button" class="step-review__edit" @click="editField('tier')">
            <Icon name="lucide:pencil" size="12" />
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="step-review__error">
        <Icon name="lucide:alert-circle" size="14" />
        {{ error }}
      </div>

      <!-- Create button -->
      <AppButton
        variant="gradient"
        size="lg"
        :disabled="creating || !form.title.trim()"
        class="step-review__create-btn"
        @click="emit('create')"
      >
        <Icon
          :name="creating ? 'lucide:loader-2' : 'lucide:sparkles'"
          size="16"
          :class="{ 'spin-animation': creating }"
        />
        {{ creating ? t('wizard.creating') : t('wizard.createEvent') }}
      </AppButton>
    </template>

    <!-- Post-creation: Celebration -->
    <WizardCelebration
      v-else
      :event="createdEvent"
    />
  </div>
</template>

<style scoped>
.step-review {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
}

.step-review__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.step-review__card {
  width: 100%;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  overflow: hidden;
  animation: card-enter 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.step-review__type-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.step-review__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-light);
}

.step-review__row-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.step-review__row-label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.step-review__row-value {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.step-review__row-value--title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-base);
}

.step-review__edit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.step-review__edit:hover {
  background: var(--color-background-alt);
  color: var(--color-accent);
}

.step-review__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(231, 76, 60, 0.08);
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: var(--radius-sm);
  color: var(--color-error);
  font-size: var(--text-sm);
  width: 100%;
}

.step-review__create-btn {
  min-width: 220px;
}

.spin-animation { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
