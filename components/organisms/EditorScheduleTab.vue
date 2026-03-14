<script setup>
const { t } = useI18n()
const { eventId, eventData, form, canEdit } = useEventEditor()

const hasAi = computed(() => !!eventData.value?.features?.aiAssistant)
const hasTimeline = computed(() => !!eventData.value?.features?.timeline)

const {
  subEventSuggestions,
  loadingSubEvents,
  suggestSubEvents,
  dismissSubEventSuggestion,
} = useAiSuggestions()

const subEventListRef = ref(null)
const programmeBannerDismissed = ref(false)
const loadingTemplate = ref(false)

const showProgrammeBanner = computed(() => {
  if (programmeBannerDismissed.value) return false
  if (!canEdit) return false
  const subEvents = subEventListRef.value?.subEvents
  return !subEvents || subEvents.length === 0
})

function onSuggestActivities() {
  suggestSubEvents({
    eventType: form.eventType,
    eventTitle: form.title,
    description: form.description,
    eventDate: form.eventDate,
  })
}

async function onUseTemplate() {
  loadingTemplate.value = true
  try {
    const templates = await $fetch('/api/templates/system')
    const template = templates.find((t) => t.eventType === form.eventType)
    if (template?.subEventTemplates) {
      for (const se of template.subEventTemplates) {
        await $fetch(`/api/events/${eventData.value.id}/sub-events`, {
          method: 'POST',
          body: {
            title: se.title,
            durationMinutes: se.durationMinutes || null,
          },
        })
      }
      subEventListRef.value?.fetchSubEvents?.()
    }
  } finally {
    loadingTemplate.value = false
  }
}

async function acceptSubEvent(suggestion) {
  await $fetch(`/api/events/${eventData.value.id}/sub-events`, {
    method: 'POST',
    body: {
      title: suggestion.title,
      durationMinutes: suggestion.durationMinutes || null,
    },
  })
  const index = subEventSuggestions.value.indexOf(suggestion)
  if (index > -1) subEventSuggestions.value.splice(index, 1)
  subEventListRef.value?.fetchSubEvents?.()
}

async function acceptAllSubEvents() {
  for (const suggestion of subEventSuggestions.value) {
    await $fetch(`/api/events/${eventData.value.id}/sub-events`, {
      method: 'POST',
      body: {
        title: suggestion.title,
        durationMinutes: suggestion.durationMinutes || null,
      },
    })
  }
  subEventSuggestions.value = []
  subEventListRef.value?.fetchSubEvents?.()
}
</script>

<template>
  <div class="editor-schedule">
    <!-- Programme suggestion banner (empty state) -->
    <div v-if="showProgrammeBanner" class="programme-banner">
      <div class="programme-banner__icon-wrapper">
        <Icon name="lucide:calendar-plus" size="28" class="programme-banner__icon" />
      </div>
      <div class="programme-banner__text">
        <span class="programme-banner__title">{{ t('editor.programme.emptyTitle') }}</span>
        <span class="programme-banner__description">{{ t('editor.programme.emptySubtitle') }}</span>
      </div>
      <div class="programme-banner__actions">
        <AppButton
          v-if="hasAi"
          variant="primary"
          size="sm"
          :disabled="loadingSubEvents"
          @click="onSuggestActivities"
        >
          <Icon name="lucide:sparkles" size="14" :class="{ 'programme-banner__spinner': loadingSubEvents }" />
          {{ loadingSubEvents ? t('editor.ai.loading') : t('editor.programme.generateAi') }}
        </AppButton>
        <AppButton
          v-if="form.eventType"
          variant="outline"
          size="sm"
          :disabled="loadingTemplate"
          @click="onUseTemplate"
        >
          <Icon name="lucide:layout-template" size="14" />
          {{ t('editor.programme.useTemplate') }}
        </AppButton>
      </div>
      <button type="button" class="programme-banner__dismiss" @click="programmeBannerDismissed = true">
        {{ t('editor.programme.dismiss') }}
      </button>

      <!-- AI suggestions from banner -->
      <div v-if="subEventSuggestions.length > 0" class="editor-schedule__suggestions">
        <TransitionGroup name="chip-list" tag="div" class="editor-schedule__chips">
          <AiSuggestionChip
            v-for="(suggestion, index) in subEventSuggestions"
            :key="suggestion.title"
            :label="suggestion.title"
            :subtitle="suggestion.durationMinutes ? `${suggestion.durationMinutes} min` : ''"
            @accept="acceptSubEvent(suggestion)"
            @dismiss="dismissSubEventSuggestion(index)"
          />
        </TransitionGroup>
        <button
          v-if="subEventSuggestions.length > 1"
          type="button"
          class="editor-schedule__accept-all"
          @click="acceptAllSubEvents"
        >
          <Icon name="lucide:check-check" size="12" />
          {{ t('editor.ai.acceptAll') }}
        </button>
      </div>
    </div>

    <!-- Sub-events -->
    <section class="editor-schedule__section">
      <SubEventList
        ref="subEventListRef"
        :event-id="eventData.id"
        :can-edit="canEdit"
      />

      <!-- AI activity suggestions -->
      <div v-if="hasAi && canEdit" class="editor-schedule__ai">
        <button
          type="button"
          class="editor-schedule__ai-btn"
          :disabled="loadingSubEvents"
          @click="onSuggestActivities"
        >
          <Icon name="lucide:sparkles" size="14" :class="{ 'editor-schedule__spinner': loadingSubEvents }" />
          {{ loadingSubEvents ? t('editor.ai.loading') : t('editor.ai.suggestActivities') }}
        </button>

        <div v-if="subEventSuggestions.length > 0" class="editor-schedule__suggestions">
          <TransitionGroup name="chip-list" tag="div" class="editor-schedule__chips">
            <AiSuggestionChip
              v-for="(suggestion, index) in subEventSuggestions"
              :key="suggestion.title"
              :label="suggestion.title"
              :subtitle="suggestion.durationMinutes ? `${suggestion.durationMinutes} min` : ''"
              @accept="acceptSubEvent(suggestion)"
              @dismiss="dismissSubEventSuggestion(index)"
            />
          </TransitionGroup>
          <button
            v-if="subEventSuggestions.length > 1"
            type="button"
            class="editor-schedule__accept-all"
            @click="acceptAllSubEvents"
          >
            <Icon name="lucide:check-check" size="12" />
            {{ t('editor.ai.acceptAll') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Timeline (Pro feature) -->
    <section
      class="editor-schedule__section"
      :class="{ 'editor-schedule__section--locked': !hasTimeline }"
    >
      <EventTimelineEditor
        :event-id="eventData.id"
        :editable="canEdit"
        :locked="!hasTimeline"
      />
    </section>
  </div>
</template>

<style scoped>
.editor-schedule {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Programme suggestion banner */
.programme-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-4);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed color-mix(in srgb, var(--color-accent) 30%, var(--color-border-light));
  border-radius: var(--radius-xl);
}

.programme-banner__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
}

.programme-banner__icon {
  color: var(--color-accent);
  opacity: 0.7;
}

.programme-banner__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.programme-banner__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.programme-banner__description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  max-width: 320px;
  line-height: var(--line-height-normal);
}

.programme-banner__actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

.programme-banner__dismiss {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.programme-banner__dismiss:hover {
  opacity: 1;
}

.programme-banner__spinner {
  animation: spin 1s linear infinite;
}

.editor-schedule__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.editor-schedule__section--locked {
  opacity: 0.5;
  position: relative;
}

.editor-schedule__ai {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.editor-schedule__ai-btn {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
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

.editor-schedule__ai-btn:hover:not(:disabled) {
  background: var(--color-accent-bg);
  box-shadow: var(--shadow-accent-sm);
}

.editor-schedule__ai-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.editor-schedule__spinner {
  animation: spin 1s linear infinite;
}

.editor-schedule__suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.editor-schedule__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.editor-schedule__accept-all {
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

.editor-schedule__accept-all:hover {
  opacity: 1;
}

/* Transitions */
.chip-list-enter-active {
  transition: all 300ms ease-out;
}

.chip-list-leave-active {
  transition: all 200ms ease-in;
}

.chip-list-enter-from {
  opacity: 0;
  transform: translateY(4px) scale(0.95);
}

.chip-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
