<script setup>
const { t } = useI18n()
const { form, startMode, populateFromAi } = useWizardState()

const props = defineProps({
  wizardAi: { type: Object, required: true },
})

const emit = defineEmits(['manual', 'aiComplete'])

const aiDescription = ref('')

// Accept prompt from dashboard QuickCreateCard via query param
const route = useRoute()
onMounted(() => {
  if (route.query.prompt) {
    aiDescription.value = String(route.query.prompt)
  }
})

function startManual() {
  startMode.value = 'manual'
  emit('manual')
}

async function buildWithAi() {
  if (!aiDescription.value.trim()) return
  if (!props.wizardAi.canUseBuildEvent.value) return

  const result = await props.wizardAi.buildEvent(aiDescription.value.trim())
  if (result) {
    populateFromAi(result)
    startMode.value = 'ai'
    emit('aiComplete')
  }
}

function onTextareaKeydown(e) {
  // Cmd/Ctrl + Enter to submit
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    buildWithAi()
  }
}
</script>

<template>
  <div class="step-start">
    <div class="step-start__header">
      <AppHeading :level="2" size="xl">{{ t('wizard.start.title') }}</AppHeading>
      <AppText size="sm" muted>{{ t('wizard.start.subtitle') }}</AppText>
    </div>

    <!-- AI-first: main prompt area -->
    <div class="step-start__ai-area">
      <div class="step-start__ai-input-wrap">
        <div class="step-start__ai-label">
          <Icon name="lucide:sparkles" size="16" class="step-start__ai-icon" />
          <span>{{ t('wizard.start.ai.inputTitle') }}</span>
        </div>

        <textarea
          v-model="aiDescription"
          class="step-start__textarea"
          :placeholder="t('wizard.start.ai.placeholder')"
          rows="3"
          autofocus
          @keydown="onTextareaKeydown"
        />

        <!-- AI Progress Steps -->
        <AiProgressSteps
          v-if="wizardAi.buildLoading.value"
        />

        <div v-if="wizardAi.buildError.value" class="step-start__error">
          <Icon name="lucide:alert-circle" size="14" />
          {{ wizardAi.buildError.value }}
        </div>

        <!-- Free tier exhausted -->
        <div v-if="wizardAi.freeBuildExhausted.value" class="step-start__upsell">
          <Icon name="lucide:sparkles" size="14" />
          <span>{{ t('wizard.start.ai.upsell') }}</span>
        </div>

        <div class="step-start__ai-actions">
          <span class="step-start__shortcut">
            {{ navigator?.platform?.includes('Mac') ? '⌘' : 'Ctrl' }} + Enter
          </span>
          <AppButton
            variant="gradient"
            size="sm"
            :disabled="!aiDescription.trim() || wizardAi.buildLoading.value || !wizardAi.canUseBuildEvent.value"
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
    </div>

    <!-- Manual fallback -->
    <div class="step-start__manual">
      <button
        type="button"
        class="step-start__manual-link"
        @click="startManual"
      >
        {{ t('wizard.start.manual.fallback') }}
        <Icon name="lucide:arrow-right" size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-start {
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.step-start__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* AI-first area */
.step-start__ai-area {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.step-start__ai-input-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border: 2px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border-light));
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
  transition: border-color var(--transition-base);
}

.step-start__ai-input-wrap:focus-within {
  border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-border-light));
}

.step-start__ai-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
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

.step-start__upsell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-size: var(--text-sm);
}

.step-start__ai-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-start__shortcut {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* Manual fallback */
.step-start__manual {
  display: flex;
  justify-content: center;
}

.step-start__manual-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.step-start__manual-link:hover {
  color: var(--color-text-primary);
}

.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
