<script setup>
const { t } = useI18n()
const { form, eventData, eventTypes, errors, touched, markTouched } = useEventEditor()
const { icon } = useEventTheme(computed(() => form.eventType))
const { staggerIn } = useEditorAnimations()

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

// Auto-resize description
const descriptionRef = ref(null)

function autoResize() {
  const el = descriptionRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.max(80, el.scrollHeight) + 'px'
}

watch(() => form.description, () => nextTick(autoResize))

onMounted(() => {
  nextTick(autoResize)
})

// Stagger animation on mount
const detailsRef = ref(null)
onMounted(() => {
  nextTick(() => staggerIn(detailsRef.value, '.editor-details__section, .editor-details__field, .editor-details__ai-row'))
})
</script>

<template>
  <div ref="detailsRef" class="editor-details">
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
        ref="descriptionRef"
        v-model="form.description"
        class="editor-details__description"
        rows="3"
        :placeholder="t('dashboard.eventEditor.descriptionPlaceholder')"
        @input="autoResize"
        @blur="markTouched('description')"
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
          v-for="(type, index) in eventTypes"
          :key="type"
          type="button"
          class="editor-details__type-card"
          :class="{ 'editor-details__type-card--active': form.eventType === type }"
          :data-event-type="type"
          :style="{ animationDelay: `${index * 50}ms` }"
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
          <EditorDatePicker
            v-model="form.eventDate"
            :placeholder="t('editor.datePicker.selectDate')"
            :error="errors.eventDate"
            :touched="touched.eventDate"
            @blur="markTouched('eventDate')"
          />
        </div>

        <div class="editor-details__prop">
          <span class="editor-details__prop-label">
            <Icon name="lucide:calendar-check" size="14" />
            {{ t('dashboard.eventEditor.eventEndDateLabel') }}
          </span>
          <EditorDatePicker
            v-model="form.eventEndDate"
            :placeholder="t('editor.datePicker.selectEndDate')"
            :min-date="form.eventDate"
            :error="errors.eventEndDate"
            :touched="touched.eventEndDate"
            @blur="markTouched('eventEndDate')"
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
            @blur="markTouched('location')"
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

/* Notion-style inline description */
.editor-details__description {
  width: 100%;
  border: 1px solid transparent;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding: var(--space-3);
  resize: none;
  overflow: hidden;
  min-height: 80px;
  line-height: var(--line-height-relaxed);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
}

.editor-details__description:hover {
  background: color-mix(in srgb, var(--color-text-primary) 2%, transparent);
}

.editor-details__description:focus {
  border-color: var(--color-accent);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.editor-details__description::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
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
  transform: translateY(-1px);
}

.editor-details__type-card--active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-bg);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

/* Property rows — Notion-style */
.editor-details__props {
  display: flex;
  flex-direction: column;
}

.editor-details__prop {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-3);
  margin: 0 calc(-1 * var(--space-3));
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.editor-details__prop:hover {
  background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
}

.editor-details__prop + .editor-details__prop {
  border-top: 1px solid color-mix(in srgb, var(--color-border-light) 40%, transparent);
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
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}

.editor-details__prop-value:hover {
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
}

.editor-details__prop-value:focus {
  background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 25%, transparent);
}

.editor-details__prop-value::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
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
