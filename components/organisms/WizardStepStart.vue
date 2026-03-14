<script setup>
const { t } = useI18n()
const { form, startMode, populateFromAi } = useWizardState()

const props = defineProps({
  wizardAi: { type: Object, required: true },
})

const emit = defineEmits(['manual', 'aiComplete'])

const showAiInput = ref(false)
const aiDescription = ref('')

function startManual() {
  startMode.value = 'manual'
  emit('manual')
}

function startWithAi() {
  if (!props.wizardAi.canUseBuildEvent.value) return
  showAiInput.value = true
}

async function buildWithAi() {
  if (!aiDescription.value.trim()) return

  const result = await props.wizardAi.buildEvent(aiDescription.value.trim())
  if (result) {
    populateFromAi(result)
    startMode.value = 'ai'
    emit('aiComplete')
  }
}
</script>

<template>
  <div class="step-start">
    <div class="step-start__header">
      <AppHeading :level="2" size="xl">{{ t('wizard.start.title') }}</AppHeading>
      <AppText size="sm" muted>{{ t('wizard.start.subtitle') }}</AppText>
    </div>

    <div v-if="!showAiInput" class="step-start__choices">
      <!-- Manual card -->
      <button
        type="button"
        class="step-start__card"
        @click="startManual"
      >
        <div class="step-start__card-icon">
          <Icon name="lucide:pencil-line" size="28" />
        </div>
        <div class="step-start__card-content">
          <span class="step-start__card-title">{{ t('wizard.start.manual.title') }}</span>
          <span class="step-start__card-desc">{{ t('wizard.start.manual.description') }}</span>
        </div>
        <Icon name="lucide:arrow-right" size="16" class="step-start__card-arrow" />
      </button>

      <!-- AI card -->
      <button
        type="button"
        class="step-start__card step-start__card--ai"
        :class="{ 'step-start__card--locked': !wizardAi.canUseBuildEvent.value }"
        @click="wizardAi.canUseBuildEvent.value ? startWithAi() : null"
      >
        <div class="step-start__card-icon step-start__card-icon--ai">
          <Icon name="lucide:sparkles" size="28" />
        </div>
        <div class="step-start__card-content">
          <div class="step-start__card-title-row">
            <span class="step-start__card-title">{{ t('wizard.start.ai.title') }}</span>
            <span v-if="!wizardAi.canUseBuildEvent.value" class="step-start__card-badge">
              <Icon name="lucide:lock" size="10" />
              Standard+
            </span>
          </div>
          <span class="step-start__card-desc">{{ t('wizard.start.ai.description') }}</span>
        </div>
        <Icon name="lucide:arrow-right" size="16" class="step-start__card-arrow" />
      </button>
    </div>

    <!-- AI Quick Start input -->
    <Transition name="fade-up">
      <div v-if="showAiInput" class="step-start__ai-input">
        <div class="step-start__ai-header">
          <Icon name="lucide:sparkles" size="20" class="step-start__ai-icon" />
          <AppHeading :level="3" size="base">{{ t('wizard.start.ai.inputTitle') }}</AppHeading>
        </div>

        <textarea
          v-model="aiDescription"
          class="step-start__textarea"
          :placeholder="t('wizard.start.ai.placeholder')"
          rows="3"
          autofocus
        />

        <div v-if="wizardAi.buildError.value" class="step-start__error">
          <Icon name="lucide:alert-circle" size="14" />
          {{ wizardAi.buildError.value }}
        </div>

        <div class="step-start__ai-actions">
          <AppButton
            variant="ghost"
            size="sm"
            @click="showAiInput = false; aiDescription = ''"
          >
            {{ t('wizard.start.ai.back') }}
          </AppButton>
          <AppButton
            variant="gradient"
            size="sm"
            :disabled="!aiDescription.trim() || wizardAi.buildLoading.value"
            @click="buildWithAi"
          >
            <Icon
              :name="wizardAi.buildLoading.value ? 'lucide:loader-2' : 'lucide:sparkles'"
              size="14"
              :class="{ 'spin-animation': wizardAi.buildLoading.value }"
            />
            {{ wizardAi.buildLoading.value ? t('wizard.start.ai.building') : t('wizard.start.ai.build') }}
          </AppButton>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.step-start {
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.step-start__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.step-start__choices {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.step-start__card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  cursor: pointer;
  font-family: var(--font-family);
  text-align: left;
  transition: all var(--transition-base);
}

.step-start__card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.step-start__card:active {
  transform: scale(0.98);
}

.step-start__card--ai {
  border-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-border-light));
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.step-start__card--ai:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-accent-sm);
}

.step-start__card--locked {
  opacity: 0.7;
  cursor: default;
}

.step-start__card--locked:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--color-border-light);
}

.step-start__card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--color-background-alt);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.step-start__card-icon--ai {
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

.step-start__card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.step-start__card-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.step-start__card-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.step-start__card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

.step-start__card-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  font-size: 0.625rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.step-start__card-arrow {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.step-start__card:hover .step-start__card-arrow {
  transform: translateX(3px);
  color: var(--color-accent);
}

/* AI Input */
.step-start__ai-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 2px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border-light));
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.step-start__ai-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.step-start__ai-icon {
  color: var(--color-accent);
}

.step-start__textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-background);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  resize: vertical;
  outline: none;
  transition: border-color var(--transition-fast);
  line-height: var(--line-height-normal);
}

.step-start__textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.step-start__textarea::placeholder {
  color: var(--color-text-muted);
}

.step-start__error {
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

.step-start__ai-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Transitions */
.fade-up-enter-active {
  transition: all 400ms ease-out;
}

.fade-up-leave-active {
  transition: all 200ms ease-in;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
