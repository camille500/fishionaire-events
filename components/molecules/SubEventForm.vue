<script setup>
const { t, locale } = useI18n()

const props = defineProps({
  subEvent: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  eventDate: {
    type: String,
    default: null,
  },
  hasAi: {
    type: Boolean,
    default: false,
  },
  eventType: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])

// Convert UTC date to datetime-local format for prefill
function toLocalDatetime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const form = reactive({
  title: props.subEvent?.title || '',
  description: props.subEvent?.description || '',
  type: props.subEvent?.type || 'generic',
  startTime: props.subEvent?.startTime
    ? toLocalDatetime(props.subEvent.startTime)
    : (props.eventDate ? toLocalDatetime(props.eventDate) : ''),
  endTime: props.subEvent?.endTime ? toLocalDatetime(props.subEvent.endTime) : '',
  location: props.subEvent?.location || '',
  locationLat: props.subEvent?.locationLat ?? null,
  locationLon: props.subEvent?.locationLon ?? null,
  capacity: props.subEvent?.capacity || null,
  dressCode: props.subEvent?.dressCode || '',
  typeConfig: props.subEvent?.typeConfig || {},
})

// AI description generator
const aiGenerator = props.hasAi ? useAiDescriptionGenerator() : null

function generateDescription() {
  if (!aiGenerator || !form.title.trim()) return
  aiGenerator.prompt.value = `Write a short description for a "${form.title}" sub-event (type: ${form.type}) for a ${props.eventType || 'general'} event.`
  aiGenerator.language.value = locale.value
  aiGenerator.length.value = 'kort'
  aiGenerator.generate()
}

// Watch AI output and stream into description
if (aiGenerator) {
  watch(() => aiGenerator.generatedText.value, (text) => {
    if (text) form.description = text
  })
}

// Party config helpers
const partyConfig = computed({
  get() {
    return {
      musicRequestsEnabled: form.typeConfig.musicRequestsEnabled ?? true,
    }
  },
  set(val) {
    form.typeConfig = { ...form.typeConfig, ...val }
  },
})

// Activity config helpers
const activityConfig = computed({
  get() {
    return {
      skillLevel: form.typeConfig.skillLevel || null,
      materialsNeeded: form.typeConfig.materialsNeeded || [],
    }
  },
  set(val) {
    form.typeConfig = { ...form.typeConfig, ...val }
  },
})

const materialsText = computed({
  get() {
    return (form.typeConfig.materialsNeeded || []).join(', ')
  },
  set(val) {
    form.typeConfig = {
      ...form.typeConfig,
      materialsNeeded: val.split(',').map((s) => s.trim()).filter(Boolean),
    }
  },
})

function toggleMusicRequests(e) {
  form.typeConfig = { ...form.typeConfig, musicRequestsEnabled: e.target.checked }
}

function toggleAutoApprove(e) {
  form.typeConfig = { ...form.typeConfig, autoApproveRequests: e.target.checked }
}

function setSkillLevel(e) {
  form.typeConfig = { ...form.typeConfig, skillLevel: e.target.value || null }
}

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

function onSubmit() {
  emit('submit', {
    title: form.title,
    description: form.description || null,
    type: form.type,
    startTime: form.startTime || null,
    endTime: form.endTime || null,
    location: form.location || null,
    locationLat: form.locationLat,
    locationLon: form.locationLon,
    capacity: form.type === 'activity' ? form.capacity : null,
    dressCode: form.type === 'party' ? form.dressCode : null,
    typeConfig: form.typeConfig,
  })
}
</script>

<template>
  <form class="sub-event-form" @submit.prevent="onSubmit">
    <!-- Type selector -->
    <div class="sub-event-form__field">
      <label class="sub-event-form__label">{{ t('editor.subEventTypes.chooseType') }}</label>
      <SubEventTypeSelector v-model="form.type" :disabled="loading" />
    </div>

    <!-- Common fields -->
    <div class="sub-event-form__field">
      <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventTitle') }}</label>
      <AppInput
        v-model="form.title"
        :placeholder="t('dashboard.eventEditor.subEventTitlePlaceholder')"
        :disabled="loading"
        icon="lucide:tag"
      />
    </div>
    <div class="sub-event-form__field">
      <div class="sub-event-form__label-row">
        <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventDescription') }}</label>
        <button
          v-if="hasAi && form.title.trim()"
          type="button"
          class="sub-event-form__ai-btn"
          :disabled="aiGenerator?.isGenerating.value"
          @click="generateDescription"
        >
          <Icon name="lucide:sparkles" size="12" :class="{ 'sub-event-form__spinner': aiGenerator?.isGenerating.value }" />
          {{ aiGenerator?.isGenerating.value ? t('editor.ai.loading') : t('editor.ai.writeDescription') }}
        </button>
      </div>
      <AppTextarea
        v-model="form.description"
        :placeholder="t('dashboard.eventEditor.subEventDescriptionPlaceholder')"
        :disabled="loading"
        :rows="2"
      />
    </div>
    <div class="sub-event-form__row">
      <div class="sub-event-form__field">
        <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventStartTime') }}</label>
        <AppInput v-model="form.startTime" type="datetime-local" :disabled="loading" />
      </div>
      <div class="sub-event-form__field">
        <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventEndTime') }}</label>
        <AppInput v-model="form.endTime" type="datetime-local" :disabled="loading" />
      </div>
    </div>
    <div class="sub-event-form__field">
      <label class="sub-event-form__label">{{ t('dashboard.eventEditor.subEventLocation') }}</label>
      <AddressAutocompleteInput
        v-model="form.location"
        :placeholder="t('dashboard.eventEditor.subEventLocationPlaceholder')"
        :disabled="loading"
        @select="onLocationSelect"
        @update:model-value="onLocationInput"
      />
    </div>

    <!-- Party-specific fields -->
    <template v-if="form.type === 'party'">
      <div class="sub-event-form__divider" />
      <div class="sub-event-form__type-header">
        <SubEventTypeIcon type="party" size="xs" />
        <span>{{ t('editor.subEventTypes.partySettings') }}</span>
      </div>
      <div class="sub-event-form__field">
        <label class="sub-event-form__label">{{ t('editor.dressCode.label') }}</label>
        <AppInput
          v-model="form.dressCode"
          :placeholder="t('editor.dressCode.placeholder')"
          :disabled="loading"
          icon="lucide:shirt"
        />
      </div>
      <div class="sub-event-form__check-row">
        <label class="sub-event-form__checkbox">
          <input
            type="checkbox"
            :checked="partyConfig.musicRequestsEnabled"
            @change="toggleMusicRequests"
          />
          {{ t('editor.musicRequest.enableRequests') }}
        </label>
        <label v-if="partyConfig.musicRequestsEnabled" class="sub-event-form__checkbox">
          <input
            type="checkbox"
            :checked="form.typeConfig.autoApproveRequests || false"
            @change="toggleAutoApprove"
          />
          {{ t('editor.musicRequest.autoApprove') }}
        </label>
      </div>
    </template>

    <!-- Activity-specific fields -->
    <template v-if="form.type === 'activity'">
      <div class="sub-event-form__divider" />
      <div class="sub-event-form__type-header">
        <SubEventTypeIcon type="activity" size="xs" />
        <span>{{ t('editor.subEventTypes.activitySettings') }}</span>
      </div>
      <div class="sub-event-form__row">
        <div class="sub-event-form__field">
          <label class="sub-event-form__label">{{ t('editor.capacity.label') }}</label>
          <AppInput
            v-model.number="form.capacity"
            type="number"
            :placeholder="t('editor.capacity.placeholder')"
            :disabled="loading"
            icon="lucide:users"
            min="1"
          />
        </div>
        <div class="sub-event-form__field">
          <label class="sub-event-form__label">{{ t('editor.skillLevel.label') }}</label>
          <select
            class="sub-event-form__select"
            :value="form.typeConfig.skillLevel || ''"
            @change="setSkillLevel"
          >
            <option value="">{{ t('editor.skillLevel.none') }}</option>
            <option value="beginner">{{ t('editor.skillLevel.beginner') }}</option>
            <option value="intermediate">{{ t('editor.skillLevel.intermediate') }}</option>
            <option value="advanced">{{ t('editor.skillLevel.advanced') }}</option>
          </select>
        </div>
      </div>
      <div class="sub-event-form__field">
        <label class="sub-event-form__label">{{ t('editor.materials.label') }}</label>
        <AppInput
          v-model="materialsText"
          :placeholder="t('editor.materials.placeholder')"
          :disabled="loading"
          icon="lucide:package"
        />
      </div>
    </template>

    <!-- Dinner-specific hint -->
    <template v-if="form.type === 'dinner'">
      <div class="sub-event-form__divider" />
      <div class="sub-event-form__hint">
        <Icon name="lucide:info" size="12" />
        {{ t('editor.dinner.configHint') }}
      </div>
    </template>

    <!-- Ceremony-specific hint -->
    <template v-if="form.type === 'ceremony'">
      <div class="sub-event-form__divider" />
      <div class="sub-event-form__hint">
        <Icon name="lucide:info" size="12" />
        {{ t('editor.ceremony.configHint') }}
      </div>
    </template>

    <div class="sub-event-form__actions">
      <AppButton variant="ghost" size="sm" type="button" @click="emit('cancel')">
        {{ t('dashboard.cancel') }}
      </AppButton>
      <AppButton variant="primary" size="sm" :disabled="loading || !form.title.trim()">
        {{ subEvent ? t('dashboard.eventEditor.save') : t('dashboard.eventEditor.addSubEvent') }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.sub-event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.sub-event-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sub-event-form__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.sub-event-form__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.sub-event-form__ai-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sub-event-form__ai-btn:hover:not(:disabled) {
  background: var(--color-accent-bg);
  box-shadow: var(--shadow-accent-sm);
}

.sub-event-form__ai-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.sub-event-form__spinner {
  animation: spin 1s linear infinite;
}

.sub-event-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.sub-event-form__divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-1) 0;
}

.sub-event-form__type-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.sub-event-form__check-row {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.sub-event-form__checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.sub-event-form__checkbox input {
  accent-color: var(--color-accent);
}

.sub-event-form__select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}

.sub-event-form__select:hover {
  border-color: var(--color-border);
}

.sub-event-form__select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
  background: var(--color-surface);
}

.sub-event-form__hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.sub-event-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
