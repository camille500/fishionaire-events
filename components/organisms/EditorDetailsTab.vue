<script setup>
const { t } = useI18n()
const { form, eventData, eventTypes } = useEventEditor()
const { icon } = useEventTheme(computed(() => form.eventType))

const hasAi = computed(() => !!eventData.value?.features?.aiAssistant)
const {
  titleSuggestions,
  loadingTitles,
  suggestTitles,
  dismissTitleSuggestion,
} = useAiSuggestions()

function onSuggestTitles() {
  suggestTitles({ eventType: form.eventType, context: form.title || undefined })
}

function acceptTitle(title) {
  form.title = title
  titleSuggestions.value = []
}
</script>

<template>
  <div class="editor-details">
    <!-- AI title suggestions -->
    <div v-if="hasAi" class="editor-details__ai-row">
      <OnboardingTooltip
        tooltip-key="editor-ai-suggest"
        :description="t('editor.onboarding.tryAi')"
        position="bottom"
      >
        <button
          type="button"
          class="editor-details__ai-btn"
          :disabled="loadingTitles"
          @click="onSuggestTitles"
        >
          <Icon name="lucide:sparkles" size="14" :class="{ 'editor-details__spinner': loadingTitles }" />
          {{ loadingTitles ? t('editor.ai.loading') : t('editor.ai.suggestTitle') }}
        </button>
      </OnboardingTooltip>

      <TransitionGroup name="chip-list" tag="div" class="editor-details__chips">
        <AiSuggestionChip
          v-for="(suggestion, index) in titleSuggestions"
          :key="suggestion"
          :label="suggestion"
          @accept="acceptTitle(suggestion)"
          @dismiss="dismissTitleSuggestion(index)"
        />
      </TransitionGroup>
    </div>

    <!-- Description -->
    <div class="editor-details__field">
      <label class="editor-details__label">{{ t('dashboard.eventEditor.descriptionPlaceholder') }}</label>
      <textarea
        v-model="form.description"
        class="editor-details__description"
        rows="4"
        :placeholder="t('dashboard.eventEditor.descriptionPlaceholder')"
      />
      <AiDescriptionAssistant
        v-model="form.description"
        :event-title="form.title"
        :locked="!eventData?.features?.aiAssistant"
      />
    </div>

    <!-- Event Type -->
    <section class="editor-details__section">
      <OnboardingTooltip
        tooltip-key="editor-event-type"
        :description="t('editor.onboarding.setEventType')"
        position="bottom"
      >
        <h3 class="editor-details__section-label">{{ t('dashboard.eventEditor.eventTypeLabel') }}</h3>
      </OnboardingTooltip>
      <div class="editor-details__type-grid">
        <button
          v-for="type in eventTypes"
          :key="type"
          type="button"
          class="editor-details__type-card"
          :class="{ 'editor-details__type-card--active': form.eventType === type }"
          :data-event-type="type"
          @click="form.eventType = form.eventType === type ? '' : type"
        >
          <Icon :name="useEventTheme(type).icon.value" size="20" />
          <span>{{ t(`dashboard.eventEditor.eventTypes.${type}`) }}</span>
        </button>
      </div>
    </section>

    <!-- Date & Location -->
    <section class="editor-details__section">
      <h3 class="editor-details__section-label">{{ t('dashboard.eventEditor.detailsSection') }}</h3>
      <div class="editor-details__props">
        <div class="editor-details__prop">
          <span class="editor-details__prop-label">
            <Icon name="lucide:calendar" size="14" />
            {{ t('dashboard.eventEditor.eventDateLabel') }}
          </span>
          <input
            v-model="form.eventDate"
            type="datetime-local"
            class="editor-details__prop-value"
          />
        </div>

        <div class="editor-details__prop">
          <span class="editor-details__prop-label">
            <Icon name="lucide:calendar-check" size="14" />
            {{ t('dashboard.eventEditor.eventEndDateLabel') }}
          </span>
          <input
            v-model="form.eventEndDate"
            type="datetime-local"
            class="editor-details__prop-value"
          />
        </div>

        <div class="editor-details__prop">
          <span class="editor-details__prop-label">
            <Icon name="lucide:map-pin" size="14" />
            {{ t('dashboard.eventEditor.locationLabel') }}
          </span>
          <input
            v-model="form.location"
            type="text"
            class="editor-details__prop-value"
            :placeholder="t('dashboard.eventEditor.locationPlaceholder')"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.editor-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.editor-details__ai-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.editor-details__ai-btn {
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

.editor-details__ai-btn:hover:not(:disabled) {
  background: var(--color-accent-bg);
  box-shadow: var(--shadow-accent-sm);
}

.editor-details__ai-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.editor-details__spinner {
  animation: spin 1s linear infinite;
}

.editor-details__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.editor-details__field {
  display: flex;
  flex-direction: column;
}

.editor-details__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.editor-details__description {
  width: 100%;
  border: 1px solid var(--color-border-light);
  outline: none;
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding: var(--space-3);
  resize: vertical;
  min-height: 80px;
  line-height: var(--line-height-relaxed);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.editor-details__description:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.editor-details__description::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.editor-details__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.editor-details__section-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin: 0;
}

/* Event type cards */
.editor-details__type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-2);
}

.editor-details__type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.editor-details__type-card:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-dim);
}

.editor-details__type-card--active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-bg);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

/* Property rows */
.editor-details__props {
  display: flex;
  flex-direction: column;
}

.editor-details__prop {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border-light) 50%, transparent);
}

.editor-details__prop:last-child {
  border-bottom: none;
}

.editor-details__prop-label {
  width: 160px;
  flex-shrink: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.editor-details__prop-value {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.editor-details__prop-value:hover {
  background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
}

.editor-details__prop-value:focus {
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.editor-details__prop-value::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
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

@media (max-width: 640px) {
  .editor-details__prop {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .editor-details__prop-label {
    width: auto;
  }

  .editor-details__prop-value {
    width: 100%;
  }

  .editor-details__type-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
