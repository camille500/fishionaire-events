<script setup>
const { t } = useI18n()
const { form, touched, errors, aiPrefilled } = useWizardState()

const props = defineProps({
  wizardAi: { type: Object, required: true },
})

const showDescription = ref(!!form.description)
const generatingDescription = ref(false)

// Show description field when title has content
watch(() => form.title, (val) => {
  if (val.trim() && !showDescription.value) {
    showDescription.value = true
  }
})

function onTitleBlur() {
  touched.title = true
}

function acceptTitle(suggestion) {
  form.title = suggestion
  props.wizardAi.titleSuggestions.value = []
}

function onSuggestTitles() {
  props.wizardAi.suggestTitles({
    eventType: form.selectedType,
    context: form.title || undefined,
  })
}

async function onGenerateDescription() {
  if (!props.wizardAi.canUseDescriptionGen.value) return
  generatingDescription.value = true
  const desc = await props.wizardAi.generateDescription({
    eventType: form.selectedType,
    title: form.title,
  })
  if (desc) form.description = desc
  generatingDescription.value = false
}

const descriptionCharCount = computed(() => form.description?.length || 0)
const showCharCount = computed(() => descriptionCharCount.value > 1500)
</script>

<template>
  <div class="step-info">
    <div class="step-info__header">
      <AppHeading :level="2" size="xl">{{ t('wizard.steps.infoTitle') }}</AppHeading>
      <AppText size="sm" muted>{{ t('wizard.steps.infoSubtitle') }}</AppText>
    </div>

    <!-- Title -->
    <div class="step-info__field">
      <input
        v-model="form.title"
        type="text"
        class="step-info__title-input"
        :class="{ 'step-info__title-input--error': errors.title }"
        :placeholder="t('wizard.titlePlaceholder')"
        autofocus
        @blur="onTitleBlur"
      />
      <span v-if="aiPrefilled && form.title" class="step-info__ai-badge">
        <Icon name="lucide:sparkles" size="10" />
        AI
      </span>
      <Transition name="fade-in">
        <span v-if="errors.title" class="step-info__error">{{ errors.title }}</span>
      </Transition>

      <!-- AI title suggestions -->
      <div class="step-info__ai-row">
        <button
          type="button"
          class="step-info__ai-btn"
          :disabled="wizardAi.loadingTitles.value"
          @click="onSuggestTitles"
        >
          <Icon
            name="lucide:sparkles"
            size="12"
            :class="{ 'spin-animation': wizardAi.loadingTitles.value }"
          />
          {{ wizardAi.loadingTitles.value ? t('editor.ai.loading') : t('wizard.aiSuggestTitle') }}
        </button>
        <TransitionGroup name="chip-list" tag="div" class="step-info__chips">
          <AiSuggestionChip
            v-for="(suggestion, index) in wizardAi.titleSuggestions.value"
            :key="suggestion"
            :label="suggestion"
            @accept="acceptTitle(suggestion)"
            @dismiss="wizardAi.dismissTitleSuggestion(index)"
          />
        </TransitionGroup>
        <AppText
          v-if="wizardAi.isFree.value && wizardAi.titleSuggestions.value.length > 0"
          size="xs"
          muted
          class="step-info__upsell-hint"
        >
          <Icon name="lucide:sparkles" size="10" />
          {{ t('wizard.aiUpsellHint') }}
        </AppText>
      </div>
    </div>

    <!-- Date & Location -->
    <div class="step-info__field-row">
      <div class="step-info__field step-info__field--half">
        <label class="step-info__label">
          <Icon name="lucide:calendar" size="14" />
          {{ t('dashboard.eventEditor.eventDateLabel') }}
        </label>
        <EditorDatePicker
          :model-value="form.eventDate"
          :placeholder="t('wizard.datePlaceholder')"
          @update:model-value="form.eventDate = $event"
        />
      </div>

      <div class="step-info__field step-info__field--half">
        <label class="step-info__label">
          <Icon name="lucide:map-pin" size="14" />
          {{ t('dashboard.eventEditor.locationLabel') }}
        </label>
        <input
          v-model="form.location"
          type="text"
          class="step-info__input"
          :placeholder="t('wizard.locationPlaceholder')"
        />
      </div>
    </div>

    <!-- Description (progressive disclosure) -->
    <Transition name="expand">
      <div v-if="showDescription" class="step-info__field">
        <div class="step-info__label-row">
          <label class="step-info__label">
            <Icon name="lucide:align-left" size="14" />
            {{ t('wizard.descriptionLabel') }}
          </label>
          <button
            v-if="wizardAi.canUseDescriptionGen.value"
            type="button"
            class="step-info__ai-btn"
            :disabled="generatingDescription || !form.title.trim()"
            @click="onGenerateDescription"
          >
            <Icon
              name="lucide:sparkles"
              size="12"
              :class="{ 'spin-animation': generatingDescription }"
            />
            {{ generatingDescription ? t('editor.ai.loading') : t('wizard.aiGenerateDescription') }}
          </button>
        </div>
        <textarea
          v-model="form.description"
          class="step-info__textarea"
          :placeholder="t('wizard.descriptionPlaceholder')"
          rows="4"
        />
        <span v-if="showCharCount" class="step-info__char-count" :class="{ 'step-info__char-count--warn': descriptionCharCount > 1800 }">
          {{ descriptionCharCount }} / 2000
        </span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.step-info {
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.step-info__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.step-info__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  position: relative;
}

.step-info__field-row {
  display: flex;
  gap: var(--space-4);
}

.step-info__field--half {
  flex: 1;
}

.step-info__title-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  padding: var(--space-3) 0;
  border-bottom: 2px solid var(--color-border-light);
  transition: border-color var(--transition-fast);
}

.step-info__title-input:focus {
  border-color: var(--color-accent);
}

.step-info__title-input--error {
  border-color: var(--color-error);
}

.step-info__title-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.step-info__ai-badge {
  position: absolute;
  top: var(--space-3);
  right: 0;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-size: 0.625rem;
  font-weight: var(--font-weight-semibold);
}

.step-info__error {
  font-size: var(--text-xs);
  color: var(--color-error);
}

.step-info__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.step-info__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-info__input {
  background: var(--color-surface);
}

.step-info__textarea {
  padding: var(--space-3);
  background: var(--color-surface);
}

.step-info__char-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: right;
}

.step-info__char-count--warn {
  color: var(--color-warning);
}

/* AI elements */
.step-info__ai-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.step-info__ai-btn {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
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

.step-info__ai-btn:hover:not(:disabled) {
  background: var(--color-accent-bg);
  box-shadow: var(--shadow-accent-sm);
}

.step-info__ai-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.step-info__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.step-info__upsell-hint {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-accent);
  opacity: 0.7;
}

/* Chip transitions */
.chip-list-enter-active { transition: all 300ms ease-out; }
.chip-list-leave-active { transition: all 200ms ease-in; }
.chip-list-enter-from { opacity: 0; transform: translateY(4px) scale(0.95); }
.chip-list-leave-to { opacity: 0; transform: scale(0.9); }

/* Expand transition */
.expand-enter-active { transition: all 400ms ease-out; }
.expand-leave-active { transition: all 200ms ease-in; }
.expand-enter-from { opacity: 0; transform: translateY(-8px); max-height: 0; }
.expand-leave-to { opacity: 0; max-height: 0; }

.fade-in-enter-active { transition: opacity 200ms; }
.fade-in-enter-from { opacity: 0; }

.spin-animation { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .step-info__field-row {
    flex-direction: column;
  }
}
</style>
