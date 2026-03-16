<script setup>
const { t } = useI18n()

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  isOverride: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:settings', 'save'])

const TONE_OPTIONS = [
  { value: 'formeel', label: 'dashboard.aiSettings.tones.formeel' },
  { value: 'vriendelijk', label: 'dashboard.aiSettings.tones.vriendelijk' },
  { value: 'speels', label: 'dashboard.aiSettings.tones.speels' },
  { value: 'professioneel', label: 'dashboard.aiSettings.tones.professioneel' },
  { value: 'feestelijk', label: 'dashboard.aiSettings.tones.feestelijk' },
  { value: 'casual', label: 'dashboard.aiSettings.tones.casual' },
  { value: 'custom', label: 'dashboard.aiSettings.tones.custom' },
]

const overrideTone = ref(props.isOverride ? props.settings.aiTone !== null : true)
const overrideContext = ref(props.isOverride ? props.settings.aiExtraContext !== null : true)

const localTone = computed({
  get: () => props.settings.aiTone || 'vriendelijk',
  set: (val) => updateField('aiTone', val),
})

const localToneCustom = computed({
  get: () => props.settings.aiToneCustom || '',
  set: (val) => updateField('aiToneCustom', val),
})

const localExtraContext = computed({
  get: () => props.settings.aiExtraContext || '',
  set: (val) => updateField('aiExtraContext', val),
})

const isCustomTone = computed(() => localTone.value === 'custom')

function updateField(field, value) {
  emit('update:settings', { ...props.settings, [field]: value || null })
}

function toggleOverrideTone(checked) {
  overrideTone.value = checked
  if (!checked) {
    emit('update:settings', { ...props.settings, aiTone: null, aiToneCustom: null })
  }
}

function toggleOverrideContext(checked) {
  overrideContext.value = checked
  if (!checked) {
    emit('update:settings', { ...props.settings, aiExtraContext: null })
  }
}

function handleSave() {
  emit('save')
}
</script>

<template>
  <div class="llm-settings-form">
    <div class="llm-settings-form__field">
      <div class="llm-settings-form__field-header">
        <label class="llm-settings-form__label">{{ t('dashboard.aiSettings.toneLabel') }}</label>
        <label v-if="isOverride" class="llm-settings-form__override-toggle">
          <input
            type="checkbox"
            :checked="overrideTone"
            @change="toggleOverrideTone($event.target.checked)"
          />
          <span>{{ t('dashboard.aiSettings.overrideAccount') }}</span>
        </label>
      </div>
      <p class="llm-settings-form__hint">{{ t('dashboard.aiSettings.toneHint') }}</p>
      <select
        v-model="localTone"
        class="llm-settings-form__select"
        :disabled="isOverride && !overrideTone"
      >
        <option v-for="option in TONE_OPTIONS" :key="option.value" :value="option.value">
          {{ t(option.label) }}
        </option>
      </select>
      <textarea
        v-if="isCustomTone && (!isOverride || overrideTone)"
        v-model="localToneCustom"
        class="llm-settings-form__textarea llm-settings-form__textarea--small"
        :placeholder="t('dashboard.aiSettings.toneCustomPlaceholder')"
        rows="2"
        maxlength="200"
      />
    </div>

    <div class="llm-settings-form__field">
      <div class="llm-settings-form__field-header">
        <label class="llm-settings-form__label">{{ t('dashboard.aiSettings.extraContextLabel') }}</label>
        <label v-if="isOverride" class="llm-settings-form__override-toggle">
          <input
            type="checkbox"
            :checked="overrideContext"
            @change="toggleOverrideContext($event.target.checked)"
          />
          <span>{{ t('dashboard.aiSettings.overrideAccount') }}</span>
        </label>
      </div>
      <p class="llm-settings-form__hint">{{ t('dashboard.aiSettings.extraContextHint') }}</p>
      <textarea
        v-model="localExtraContext"
        class="llm-settings-form__textarea"
        :placeholder="t('dashboard.aiSettings.extraContextPlaceholder')"
        rows="3"
        maxlength="500"
        :disabled="isOverride && !overrideContext"
      />
      <span class="llm-settings-form__char-count">
        {{ (localExtraContext || '').length }} / 500
      </span>
    </div>

    <button
      type="button"
      class="llm-settings-form__save"
      :disabled="saving"
      @click="handleSave"
    >
      {{ saving ? t('dashboard.aiSettings.saving') : t('dashboard.aiSettings.save') }}
    </button>
  </div>
</template>

<style scoped>
.llm-settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.llm-settings-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.llm-settings-form__field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.llm-settings-form__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.llm-settings-form__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.llm-settings-form__override-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.llm-settings-form__override-toggle input {
  accent-color: var(--color-accent);
}

.llm-settings-form__select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  transition: border-color var(--transition-fast);
}

.llm-settings-form__select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.llm-settings-form__select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.llm-settings-form__textarea {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.llm-settings-form__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.llm-settings-form__textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.llm-settings-form__textarea--small {
  margin-top: var(--space-1);
}

.llm-settings-form__char-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: right;
}

.llm-settings-form__save {
  align-self: flex-start;
  padding: var(--space-2) var(--space-5);
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.llm-settings-form__save:hover {
  opacity: 0.9;
}

.llm-settings-form__save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
