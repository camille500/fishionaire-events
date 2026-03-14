<script setup>
import { VueDraggable } from 'vue-draggable-plus'

const { t } = useI18n()
const { form, addSubEvent, removeSubEvent, updateSubEvent } = useWizardState()

const props = defineProps({
  wizardAi: { type: Object, required: true },
})

function onSuggestActivities() {
  props.wizardAi.suggestSubEvents({
    eventType: form.selectedType,
    eventTitle: form.title,
    existingSubEvents: form.subEvents.filter((se) => se.title.trim()),
  })
}

function acceptSubEventSuggestion(suggestion) {
  form.subEvents.push({
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: suggestion.title,
    durationMinutes: suggestion.durationMinutes || null,
    description: '',
  })
  const index = props.wizardAi.subEventSuggestions.value.indexOf(suggestion)
  if (index > -1) props.wizardAi.subEventSuggestions.value.splice(index, 1)
}

function acceptAllSuggestions() {
  for (const suggestion of props.wizardAi.subEventSuggestions.value) {
    form.subEvents.push({
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: suggestion.title,
      durationMinutes: suggestion.durationMinutes || null,
      description: '',
    })
  }
  props.wizardAi.subEventSuggestions.value = []
}
</script>

<template>
  <div class="step-activities">
    <div class="step-activities__header">
      <AppHeading :level="2" size="xl">{{ t('wizard.steps.activitiesTitle') }}</AppHeading>
      <AppText size="sm" muted>{{ t('wizard.steps.activitiesSubtitle') }}</AppText>
    </div>

    <!-- Draggable list -->
    <VueDraggable
      v-if="form.subEvents.length > 0"
      v-model="form.subEvents"
      :animation="200"
      handle=".wizard-sub-event__drag"
      class="step-activities__list"
    >
      <WizardSubEventItem
        v-for="(se, index) in form.subEvents"
        :key="se.id"
        :model-value="se"
        @update:model-value="(val) => updateSubEvent(index, val)"
        @remove="removeSubEvent(index)"
      />
    </VueDraggable>

    <!-- Empty state -->
    <div v-else class="step-activities__empty">
      <Icon name="lucide:layers" size="28" />
      <AppText size="sm" muted>{{ t('wizard.activitiesEmpty') }}</AppText>
      <AppText size="xs" muted>{{ t('wizard.activitiesEmptyHint') }}</AppText>
    </div>

    <!-- Action buttons -->
    <div class="step-activities__actions">
      <AppButton variant="ghost" size="sm" @click="addSubEvent">
        <Icon name="lucide:plus" size="14" />
        {{ t('wizard.addActivity') }}
      </AppButton>
      <button
        v-if="wizardAi.canUseSubEventSuggestions.value"
        type="button"
        class="step-activities__ai-btn"
        :disabled="wizardAi.loadingSubEvents.value"
        @click="onSuggestActivities"
      >
        <Icon
          name="lucide:sparkles"
          size="12"
          :class="{ 'spin-animation': wizardAi.loadingSubEvents.value }"
        />
        {{ wizardAi.loadingSubEvents.value ? t('editor.ai.loading') : t('wizard.aiSuggestActivities') }}
      </button>
      <AppText
        v-else-if="wizardAi.isFree.value"
        size="xs"
        muted
        class="step-activities__locked-hint"
      >
        <Icon name="lucide:lock" size="10" />
        {{ t('wizard.aiActivitiesLocked') }}
      </AppText>
    </div>

    <!-- AI Suggestions -->
    <div v-if="wizardAi.subEventSuggestions.value.length > 0" class="step-activities__suggestions">
      <TransitionGroup name="chip-list" tag="div" class="step-activities__chips">
        <AiSuggestionChip
          v-for="(suggestion, index) in wizardAi.subEventSuggestions.value"
          :key="suggestion.title"
          :label="suggestion.title"
          :subtitle="suggestion.durationMinutes ? `${suggestion.durationMinutes} min` : ''"
          @accept="acceptSubEventSuggestion(suggestion)"
          @dismiss="wizardAi.dismissSubEventSuggestion(index)"
        />
      </TransitionGroup>
      <button
        v-if="wizardAi.subEventSuggestions.value.length > 1"
        type="button"
        class="step-activities__accept-all"
        @click="acceptAllSuggestions"
      >
        <Icon name="lucide:check-check" size="12" />
        {{ t('editor.ai.acceptAll') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-activities {
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.step-activities__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.step-activities__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.step-activities__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
  text-align: center;
}

.step-activities__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.step-activities__ai-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.step-activities__ai-btn:hover:not(:disabled) {
  background: var(--color-accent-bg);
  box-shadow: var(--shadow-accent-sm);
}

.step-activities__ai-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.step-activities__locked-hint {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  opacity: 0.6;
}

.step-activities__suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.step-activities__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.step-activities__accept-all {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.step-activities__accept-all:hover {
  opacity: 1;
}

/* Transitions */
.chip-list-enter-active { transition: all 300ms ease-out; }
.chip-list-leave-active { transition: all 200ms ease-in; }
.chip-list-enter-from { opacity: 0; transform: translateY(4px) scale(0.95); }
.chip-list-leave-to { opacity: 0; transform: scale(0.9); }

.spin-animation { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
