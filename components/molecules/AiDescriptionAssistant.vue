<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  eventTitle: { type: String, default: '' },
  locked: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'upgrade'])

const { t } = useI18n()

const isOpen = ref(false)
const showUpgrade = ref(false)
const refineInput = ref('')

const {
  prompt,
  tone,
  language,
  length,
  eventType,
  includeEmojis,
  generatedText,
  isGenerating,
  error,
  history,
  generate,
  refine,
  abort,
  selectFromHistory,
  clear,
} = useAiDescriptionGenerator()

const tones = [
  { value: 'vriendelijk', key: 'friendly' },
  { value: 'formeel', key: 'formal' },
  { value: 'speels', key: 'playful' },
  { value: 'professioneel', key: 'professional' },
  { value: 'feestelijk', key: 'festive' },
  { value: 'casual', key: 'casual' },
]

const lengths = [
  { value: 'kort', key: 'short' },
  { value: 'middel', key: 'medium' },
  { value: 'lang', key: 'long' },
]

const eventTypes = [
  { value: '', key: 'none' },
  { value: 'verjaardag', key: 'birthday' },
  { value: 'bruiloft', key: 'wedding' },
  { value: 'bedrijfsevenement', key: 'corporate' },
  { value: 'festival', key: 'festival' },
  { value: 'diner', key: 'dinner' },
  { value: 'babyshower', key: 'babyshower' },
  { value: 'overig', key: 'other' },
]

function handleGenerate() {
  if (props.eventTitle && !prompt.value.includes(props.eventTitle)) {
    const fullPrompt = props.eventTitle + ': ' + prompt.value
    prompt.value = fullPrompt
  }
  generate()
}

function handleRefine() {
  if (!refineInput.value.trim()) return
  refine(refineInput.value.trim())
  refineInput.value = ''
}

function accept() {
  emit('update:modelValue', generatedText.value)
  isOpen.value = false
}
</script>

<template>
  <div class="ai-assistant">
    <button
      type="button"
      class="ai-assistant__trigger"
      :class="{ 'ai-assistant__trigger--open': isOpen }"
      @click="isOpen = !isOpen"
    >
      <Icon name="lucide:sparkles" size="16" />
      {{ t('aiAssistant.title') }}
      <Icon
        name="lucide:chevron-down"
        size="14"
        class="ai-assistant__chevron"
        :class="{ 'ai-assistant__chevron--open': isOpen }"
      />
    </button>

    <Transition name="slide">
      <div v-if="isOpen && locked && showUpgrade" class="ai-assistant__panel">
        <EventUpgradePanel
          @close="showUpgrade = false"
          @upgraded="showUpgrade = false; isOpen = false"
        />
      </div>
      <div v-else-if="isOpen && locked" class="ai-assistant__panel ai-assistant__panel--locked">
        <div class="ai-assistant__upsell">
          <div class="ai-assistant__upsell-icon">
            <Icon name="lucide:lock" size="20" />
          </div>
          <p class="ai-assistant__upsell-title">{{ t('aiAssistant.premiumTitle') }}</p>
          <p class="ai-assistant__upsell-description">{{ t('aiAssistant.premiumDescription') }}</p>
          <button type="button" class="ai-assistant__upsell-btn" @click="showUpgrade = true">
            <Icon name="lucide:crown" size="14" />
            {{ t('aiAssistant.premiumUpgrade') }}
          </button>
        </div>
      </div>
      <div v-else-if="isOpen" class="ai-assistant__panel">
        <div class="ai-assistant__prompt-group">
          <label class="ai-assistant__label">{{ t('aiAssistant.promptLabel') }}</label>
          <textarea
            v-model="prompt"
            class="ai-assistant__prompt"
            rows="2"
            :placeholder="t('aiAssistant.promptPlaceholder')"
            :disabled="isGenerating"
          />
        </div>

        <div class="ai-assistant__options">
          <div class="ai-assistant__option-group">
            <label class="ai-assistant__option-label">{{ t('aiAssistant.toneLabel') }}</label>
            <div class="ai-assistant__pills">
              <button
                v-for="t in tones"
                :key="t.value"
                type="button"
                class="ai-assistant__pill"
                :class="{ 'ai-assistant__pill--active': tone === t.value }"
                :disabled="isGenerating"
                @click="tone = t.value"
              >
                {{ $t(`aiAssistant.tones.${t.key}`) }}
              </button>
            </div>
          </div>

          <div class="ai-assistant__row">
            <div class="ai-assistant__option-group ai-assistant__option-group--compact">
              <label class="ai-assistant__option-label">{{ t('aiAssistant.lengthLabel') }}</label>
              <div class="ai-assistant__pills">
                <button
                  v-for="l in lengths"
                  :key="l.value"
                  type="button"
                  class="ai-assistant__pill ai-assistant__pill--sm"
                  :class="{ 'ai-assistant__pill--active': length === l.value }"
                  :disabled="isGenerating"
                  @click="length = l.value"
                >
                  {{ $t(`aiAssistant.lengths.${l.key}`) }}
                </button>
              </div>
            </div>

            <div class="ai-assistant__option-group ai-assistant__option-group--compact">
              <label class="ai-assistant__option-label">{{ t('aiAssistant.languageLabel') }}</label>
              <div class="ai-assistant__pills">
                <button
                  type="button"
                  class="ai-assistant__pill ai-assistant__pill--sm"
                  :class="{ 'ai-assistant__pill--active': language === 'nl' }"
                  :disabled="isGenerating"
                  @click="language = 'nl'"
                >
                  NL
                </button>
                <button
                  type="button"
                  class="ai-assistant__pill ai-assistant__pill--sm"
                  :class="{ 'ai-assistant__pill--active': language === 'en' }"
                  :disabled="isGenerating"
                  @click="language = 'en'"
                >
                  EN
                </button>
              </div>
            </div>

            <div class="ai-assistant__option-group ai-assistant__option-group--compact">
              <label class="ai-assistant__option-label">{{ t('aiAssistant.eventTypeLabel') }}</label>
              <select
                v-model="eventType"
                class="ai-assistant__select"
                :disabled="isGenerating"
              >
                <option v-for="et in eventTypes" :key="et.value" :value="et.value">
                  {{ $t(`aiAssistant.eventTypes.${et.key}`) }}
                </option>
              </select>
            </div>
          </div>

          <label class="ai-assistant__toggle">
            <input
              v-model="includeEmojis"
              type="checkbox"
              class="ai-assistant__checkbox"
              :disabled="isGenerating"
            />
            <span class="ai-assistant__toggle-label">{{ t('aiAssistant.emojiToggle') }}</span>
          </label>
        </div>

        <div class="ai-assistant__actions-top">
          <button
            type="button"
            class="ai-assistant__generate-btn"
            :disabled="!prompt.trim() || isGenerating"
            @click="handleGenerate"
          >
            <Icon v-if="!isGenerating" name="lucide:sparkles" size="16" />
            <Icon v-else name="lucide:loader-2" size="16" class="ai-assistant__spinner" />
            {{ isGenerating ? t('aiAssistant.generating') : t('aiAssistant.generate') }}
          </button>
          <button
            v-if="isGenerating"
            type="button"
            class="ai-assistant__cancel-btn"
            @click="abort"
          >
            {{ t('aiAssistant.cancel') }}
          </button>
        </div>

        <div v-if="error" class="ai-assistant__error">
          <Icon name="lucide:alert-circle" size="14" />
          {{ error }}
        </div>

        <div v-if="generatedText || isGenerating" class="ai-assistant__preview">
          <label class="ai-assistant__label">{{ t('aiAssistant.previewLabel') }}</label>
          <div class="ai-assistant__preview-text">
            {{ generatedText }}<span v-if="isGenerating" class="ai-assistant__cursor">|</span>
          </div>
        </div>

        <div v-if="generatedText && !isGenerating" class="ai-assistant__actions-bottom">
          <button type="button" class="ai-assistant__btn ai-assistant__btn--primary" @click="accept">
            <Icon name="lucide:check" size="14" />
            {{ t('aiAssistant.accept') }}
          </button>
          <button type="button" class="ai-assistant__btn ai-assistant__btn--outline" @click="generate()">
            <Icon name="lucide:refresh-cw" size="14" />
            {{ t('aiAssistant.regenerate') }}
          </button>
          <button type="button" class="ai-assistant__btn ai-assistant__btn--ghost" @click="clear">
            {{ t('aiAssistant.discard') }}
          </button>
        </div>

        <div v-if="generatedText && !isGenerating" class="ai-assistant__refine-group">
          <div class="ai-assistant__refine-row">
            <input
              v-model="refineInput"
              type="text"
              class="ai-assistant__refine-input"
              :placeholder="t('aiAssistant.refinePlaceholder')"
              @keyup.enter="handleRefine"
            />
            <button
              type="button"
              class="ai-assistant__btn ai-assistant__btn--outline ai-assistant__btn--sm"
              :disabled="!refineInput.trim()"
              @click="handleRefine"
            >
              <Icon name="lucide:wand-2" size="14" />
              {{ t('aiAssistant.refine') }}
            </button>
          </div>
        </div>

        <div v-if="history.length > 1 && !isGenerating" class="ai-assistant__history">
          <label class="ai-assistant__option-label">{{ t('aiAssistant.historyLabel') }}</label>
          <div class="ai-assistant__history-items">
            <button
              v-for="(item, i) in history"
              :key="i"
              type="button"
              class="ai-assistant__history-item"
              :class="{ 'ai-assistant__history-item--active': item === generatedText }"
              @click="selectFromHistory(i)"
            >
              {{ item.substring(0, 60) }}{{ item.length > 60 ? '...' : '' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ai-assistant {
  margin-top: var(--space-3);
}

.ai-assistant__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ai-assistant__trigger:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-bg);
}

.ai-assistant__trigger--open {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-bg);
  border-style: solid;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
}

.ai-assistant__chevron {
  transition: transform var(--transition-fast);
}

.ai-assistant__chevron--open {
  transform: rotate(180deg);
}

.ai-assistant__panel {
  border: 1px solid var(--color-accent);
  border-top: none;
  border-radius: 0 var(--radius-md) var(--radius-md) var(--radius-md);
  background: var(--color-background);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ai-assistant__label {
  display: block;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.ai-assistant__prompt {
  background: var(--color-surface);
  resize: none;
}

.ai-assistant__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.ai-assistant__option-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ai-assistant__option-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.ai-assistant__row {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.ai-assistant__option-group--compact {
  min-width: 0;
}

.ai-assistant__pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.ai-assistant__pill {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.ai-assistant__pill:hover:not(:disabled) {
  border-color: var(--color-accent-light);
  color: var(--color-accent);
}

.ai-assistant__pill--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-text-inverse);
}

.ai-assistant__pill--active:hover:not(:disabled) {
  background: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
  color: var(--color-text-inverse);
}

.ai-assistant__pill--sm {
  padding: var(--space-1) var(--space-2);
}

.ai-assistant__pill:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-assistant__select {
  width: auto;
  padding: var(--space-1) var(--space-6);
  padding-left: var(--space-2);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
}

.ai-assistant__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.ai-assistant__toggle-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.ai-assistant__actions-top {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.ai-assistant__generate-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--gradient-accent);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ai-assistant__generate-btn:hover:not(:disabled) {
  box-shadow: var(--shadow-accent-sm);
  transform: translateY(-1px);
}

.ai-assistant__generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.ai-assistant__cancel-btn {
  padding: var(--space-2) var(--space-3);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ai-assistant__cancel-btn:hover {
  border-color: var(--color-error);
  color: var(--color-error);
}

.ai-assistant__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-assistant__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(231, 76, 60, 0.08);
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: var(--radius-sm);
  color: var(--color-error);
  font-size: var(--text-sm);
}

.ai-assistant__preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ai-assistant__preview-text {
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  white-space: pre-wrap;
  min-height: 60px;
}

.ai-assistant__cursor {
  color: var(--color-accent);
  animation: blink 0.8s step-end infinite;
  font-weight: var(--font-weight-bold);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.ai-assistant__actions-bottom {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.ai-assistant__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.ai-assistant__btn--primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.ai-assistant__btn--primary:hover {
  background: var(--color-accent-dark);
  box-shadow: var(--shadow-accent-sm);
}

.ai-assistant__btn--outline {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.ai-assistant__btn--outline:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.ai-assistant__btn--outline:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ai-assistant__btn--ghost {
  background: none;
  color: var(--color-text-muted);
}

.ai-assistant__btn--ghost:hover {
  color: var(--color-text-secondary);
}

.ai-assistant__btn--sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
}

.ai-assistant__refine-group {
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--space-3);
}

.ai-assistant__refine-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.ai-assistant__refine-input {
  flex: 1;
  background: var(--color-surface);
}

.ai-assistant__history {
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--space-3);
}

.ai-assistant__history-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-1);
}

.ai-assistant__history-item {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-assistant__history-item:hover {
  border-color: var(--color-accent-light);
  color: var(--color-text-secondary);
}

.ai-assistant__history-item--active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-bg);
}

.ai-assistant__panel--locked {
  text-align: center;
  padding: var(--space-8) var(--space-6);
}

.ai-assistant__upsell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.ai-assistant__upsell-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-accent-bg), rgba(0, 184, 148, 0.15));
  color: var(--color-accent);
}

.ai-assistant__upsell-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.ai-assistant__upsell-description {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
  max-width: 320px;
  margin: 0;
}

.ai-assistant__upsell-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--gradient-accent);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-1);
}

.ai-assistant__upsell-btn:hover {
  box-shadow: var(--shadow-accent-sm);
  transform: translateY(-1px);
}

/* Slide transition */
.slide-enter-active {
  transition: all var(--transition-base);
}

.slide-leave-active {
  transition: all var(--transition-fast);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 800px;
}
</style>
