<script setup>
const { t } = useI18n()
const { form, eventData, eventTypes, errors, touched, markTouched } = useEventEditor()
const { icon } = useEventTheme(computed(() => form.eventType))
const { staggerIn } = useEditorAnimations()

let _gsap = null
async function getGsap() {
  if (!_gsap) {
    const mod = await import('gsap')
    _gsap = mod.gsap
  }
  return _gsap
}
const typeGridRef = ref(null)

let lastSelectedLocation = ''

function onLocationSelect(result) {
  form.locationLat = parseFloat(result.lat)
  form.locationLon = parseFloat(result.lon)
  lastSelectedLocation = result.displayName
}

function onLocationInput() {
  if (form.location !== lastSelectedLocation) {
    form.locationLat = null
    form.locationLon = null
  }
}

async function selectType(type, event) {
  const isDeselect = form.eventType === type
  form.eventType = isDeselect ? '' : type

  const card = event.currentTarget
  const gsap = await getGsap()
  gsap.fromTo(card, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' })

  // Brief glow pulse on the grid (only on selection)
  if (!isDeselect && typeGridRef.value) {
    typeGridRef.value.classList.add('editor-details__type-grid--glow')
    setTimeout(() => typeGridRef.value?.classList.remove('editor-details__type-grid--glow'), 600)
  }
}

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
      <button
        type="button"
        class="editor-details__ai-btn"
        :disabled="loadingTitles"
        @click="onSuggestTitles"
      >
        <Icon name="lucide:sparkles" size="14" :class="{ 'editor-details__spinner': loadingTitles }" />
        {{ loadingTitles ? t('editor.ai.loading') : t('editor.ai.suggestTitle') }}
      </button>

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
      <h3 class="editor-details__section-label">
        {{ t('dashboard.eventEditor.eventTypeLabel') }}
        <InfoIcon :content="t('infoIcon.eventType')" position="right" />
      </h3>
      <ClientOnly>
        <div ref="typeGridRef" class="editor-details__type-grid">
          <button
            v-for="(type, index) in eventTypes"
            :key="type"
            type="button"
            class="editor-details__type-card"
            :class="{ 'editor-details__type-card--active': form.eventType === type }"
            :data-event-type="type"
            :style="{ animationDelay: `${index * 50}ms` }"
            @click="selectType(type, $event)"
          >
            <Icon :name="useEventTheme(type).icon.value" size="20" />
            <span>{{ t(`dashboard.eventEditor.eventTypes.${type}`) }}</span>
          </button>
        </div>
        <template #fallback>
          <div class="editor-details__type-grid">
            <div v-for="i in 6" :key="i" class="editor-details__type-card" style="opacity: 0.3;" />
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- Date & Location -->
    <section class="editor-details__section">
      <h3 class="editor-details__section-label">{{ t('dashboard.eventEditor.detailsSection') }}</h3>
      <div class="editor-details__props">
        <ClientOnly>
          <EditorPropertyRow :label="t('dashboard.eventEditor.eventDateLabel')" icon="lucide:calendar">
            <EditorDatePicker
              v-model="form.eventDate"
              :placeholder="t('editor.datePicker.selectDate')"
              :error="errors.eventDate"
              :touched="touched.eventDate"
              @blur="markTouched('eventDate')"
            />
          </EditorPropertyRow>

          <EditorPropertyRow :label="t('dashboard.eventEditor.eventEndDateLabel')" icon="lucide:calendar-check">
            <EditorDatePicker
              v-model="form.eventEndDate"
              :placeholder="t('editor.datePicker.selectEndDate')"
              :min-date="form.eventDate"
              :error="errors.eventEndDate"
              :touched="touched.eventEndDate"
              @blur="markTouched('eventEndDate')"
            />
          </EditorPropertyRow>
        </ClientOnly>

        <ClientOnly>
          <EditorPropertyRow :label="t('dashboard.eventEditor.locationLabel')" icon="lucide:map-pin">
            <AddressAutocompleteInput
              v-model="form.location"
              :placeholder="t('dashboard.eventEditor.locationPlaceholder')"
              @select="onLocationSelect"
              @update:model-value="onLocationInput"
            />
          </EditorPropertyRow>
        </ClientOnly>
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
  field-sizing: content;
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

.editor-details__section-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
}

/* Event type cards */
.editor-details__type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-2);
  position: relative;
}

.editor-details__type-grid::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: var(--radius-xl);
  background: radial-gradient(ellipse at center, var(--color-accent-dim), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: -1;
}

.editor-details__type-grid--glow::after {
  opacity: 1;
}

.editor-details__type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-2);
  border: 1px solid color-mix(in srgb, var(--color-accent) 15%, var(--color-border-light));
  border-bottom: 2px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-spring);
}

.editor-details__type-card :deep(.iconify) {
  color: var(--color-accent);
  transition: color var(--transition-fast);
}

.editor-details__type-card:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-dim);
  transform: translateY(-1px);
}

.editor-details__type-card--active {
  border-color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-bg);
  box-shadow: 0 0 0 2px var(--color-accent-dim), var(--shadow-accent-sm, 0 4px 12px rgba(0,0,0,0.05));
  transform: translateY(-2px);
}

/* Date polling toggle card */
.editor-details__toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition: all var(--transition-fast);
}

.editor-details__toggle-card:hover {
  border-color: var(--color-border);
}

.editor-details__toggle-card--active {
  border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.editor-details__toggle-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.editor-details__toggle-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.editor-details__toggle-card--active .editor-details__toggle-icon {
  background: var(--color-accent-bg);
}

.editor-details__toggle-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.editor-details__toggle-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-details__toggle-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

.editor-details__poll-section {
  padding: var(--space-2) 0;
}

/* Upsell card (free tier) */
.editor-details__upsell-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  opacity: 0.7;
  transition: all var(--transition-fast);
}

.editor-details__upsell-card:hover {
  opacity: 1;
  border-color: var(--color-border);
}

.editor-details__upsell-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.editor-details__upsell-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-text-muted) 8%, transparent);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Property rows — Notion-style */
.editor-details__props {
  display: flex;
  flex-direction: column;
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

/* Address autocomplete inside property row — match Notion-style inline look */
.editor-details__props :deep(.address-input__wrapper) {
  border-color: transparent;
  background: transparent;
  padding: var(--space-2) var(--space-3);
}

.editor-details__props :deep(.address-input__wrapper:hover) {
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
}

.editor-details__props :deep(.address-input__wrapper:focus-within) {
  background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
  border-color: transparent;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 25%, transparent);
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
  .editor-details__prop-value {
    width: 100%;
  }

  .editor-details__type-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
