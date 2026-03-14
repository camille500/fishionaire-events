<script setup>
import { VueDraggable } from 'vue-draggable-plus'

const { t } = useI18n()
const { subscriptionTier } = useSubscription()

const emit = defineEmits(['created', 'close'])

const eventTypes = ['birthday', 'wedding', 'baby_shower', 'dinner', 'corporate', 'other']

// Wizard state
const selectedType = ref('')
const title = ref('')
const eventDate = ref('')
const location = ref('')
const selectedTier = ref('free')
const subEvents = ref([])
const creating = ref(false)
const error = ref('')

// AI suggestions
const {
  titleSuggestions,
  subEventSuggestions,
  loadingTitles,
  loadingSubEvents,
  suggestTitles,
  suggestSubEvents,
  dismissTitleSuggestion,
  dismissSubEventSuggestion,
} = useAiSuggestions()

function onSuggestTitles() {
  suggestTitles({ eventType: selectedType.value, context: title.value || undefined })
}

function acceptTitle(suggestion) {
  title.value = suggestion
  titleSuggestions.value = []
}

function onSuggestActivities() {
  suggestSubEvents({
    eventType: selectedType.value,
    eventTitle: title.value,
    existingSubEvents: subEvents.value.filter((se) => se.title.trim()),
  })
}

function acceptSubEventSuggestion(suggestion) {
  subEvents.value.push({
    id: `ai-${Date.now()}-${Math.random()}`,
    title: suggestion.title,
    durationMinutes: suggestion.durationMinutes || null,
  })
  const index = subEventSuggestions.value.indexOf(suggestion)
  if (index > -1) subEventSuggestions.value.splice(index, 1)
}

function acceptAllSubEventSuggestions() {
  for (const suggestion of subEventSuggestions.value) {
    subEvents.value.push({
      id: `ai-${Date.now()}-${Math.random()}`,
      title: suggestion.title,
      durationMinutes: suggestion.durationMinutes || null,
    })
  }
  subEventSuggestions.value = []
}

// Stepper
const stepperItems = computed(() => [
  {
    title: t('wizard.steps.type'),
    description: t('wizard.steps.typeDescription'),
    icon: 'i-lucide-sparkles',
    slot: 'type',
  },
  {
    title: t('wizard.steps.info'),
    description: t('wizard.steps.infoDescription'),
    icon: 'i-lucide-file-text',
    slot: 'info',
  },
  {
    title: t('wizard.steps.activities'),
    description: t('wizard.steps.activitiesDescription'),
    icon: 'i-lucide-layers',
    slot: 'activities',
  },
  {
    title: t('wizard.steps.tier'),
    description: t('wizard.steps.tierDescription'),
    icon: 'i-lucide-crown',
    slot: 'tier',
  },
])

const stepper = useTemplateRef('stepper')

// Fetch system templates for pre-populating sub-events
const systemTemplates = ref([])
onMounted(async () => {
  try {
    systemTemplates.value = await $fetch('/api/templates/system')
  } catch {
    // Non-critical
  }
})

function selectType(type) {
  selectedType.value = type

  // Pre-populate sub-events from system template
  const template = systemTemplates.value.find((t) => t.eventType === type)
  if (template?.subEventTemplates) {
    subEvents.value = template.subEventTemplates.map((se, i) => ({
      id: `template-${i}`,
      title: se.title,
      durationMinutes: se.durationMinutes || null,
    }))
  } else {
    subEvents.value = []
  }

  nextTick(() => stepper.value?.next())
}

function skipType() {
  selectedType.value = ''
  subEvents.value = []
  stepper.value?.next()
}

function addActivity() {
  subEvents.value.push({
    id: `new-${Date.now()}`,
    title: '',
    durationMinutes: null,
  })
}

function removeActivity(index) {
  subEvents.value.splice(index, 1)
}

function updateActivity(index, val) {
  subEvents.value[index] = val
}

async function createEvent() {
  if (!title.value.trim()) return

  creating.value = true
  error.value = ''

  try {
    const body = {
      title: title.value.trim(),
      tier: selectedTier.value,
      eventType: selectedType.value || null,
      eventDate: eventDate.value || null,
      location: location.value || null,
      subEvents: subEvents.value
        .filter((se) => se.title.trim())
        .map((se) => ({
          title: se.title.trim(),
          durationMinutes: se.durationMinutes,
        })),
    }

    const result = await $fetch('/api/events', {
      method: 'POST',
      body,
    })

    emit('created', result)
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.errorCreating')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="wizard">
    <div class="wizard__header">
      <AppHeading :level="2" size="lg">{{ t('wizard.title') }}</AppHeading>
      <button type="button" class="wizard__close" @click="emit('close')">
        <Icon name="lucide:x" size="20" />
      </button>
    </div>

    <UStepper ref="stepper" :items="stepperItems" class="wizard__stepper">
      <!-- Step 1: Event Type -->
      <template #type>
        <div class="wizard__step">
          <div class="wizard__type-grid">
            <EventTypeCard
              v-for="type in eventTypes"
              :key="type"
              :event-type="type"
              :selected="selectedType === type"
              @select="selectType"
            />
          </div>
          <button type="button" class="wizard__skip" @click="skipType">
            {{ t('wizard.skipType') }}
          </button>
        </div>
      </template>

      <!-- Step 2: Basic Info -->
      <template #info>
        <div class="wizard__step" :data-event-type="selectedType || undefined">
          <div class="wizard__field">
            <input
              v-model="title"
              type="text"
              class="wizard__title-input"
              :placeholder="t('wizard.titlePlaceholder')"
              autofocus
            />
            <!-- AI title suggestions -->
            <div class="wizard__ai-row">
              <button
                type="button"
                class="wizard__ai-btn"
                :disabled="loadingTitles"
                @click="onSuggestTitles"
              >
                <Icon name="lucide:sparkles" size="12" :class="{ 'wizard__spinner': loadingTitles }" />
                {{ loadingTitles ? t('editor.ai.loading') : t('wizard.aiSuggestTitle') }}
              </button>
              <TransitionGroup name="chip-list" tag="div" class="wizard__chips">
                <AiSuggestionChip
                  v-for="(suggestion, index) in titleSuggestions"
                  :key="suggestion"
                  :label="suggestion"
                  @accept="acceptTitle(suggestion)"
                  @dismiss="dismissTitleSuggestion(index)"
                />
              </TransitionGroup>
            </div>
          </div>

          <div class="wizard__field-row">
            <div class="wizard__field wizard__field--half">
              <label class="wizard__label">
                <Icon name="lucide:calendar" size="14" />
                {{ t('dashboard.eventEditor.eventDateLabel') }}
              </label>
              <input
                v-model="eventDate"
                type="datetime-local"
                class="wizard__input"
              />
            </div>

            <div class="wizard__field wizard__field--half">
              <label class="wizard__label">
                <Icon name="lucide:map-pin" size="14" />
                {{ t('dashboard.eventEditor.locationLabel') }}
              </label>
              <input
                v-model="location"
                type="text"
                class="wizard__input"
                :placeholder="t('wizard.locationPlaceholder')"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Step 3: Activities / Sub-events -->
      <template #activities>
        <div class="wizard__step">
          <VueDraggable
            v-if="subEvents.length > 0"
            v-model="subEvents"
            :animation="200"
            handle=".wizard-sub-event__drag"
            class="wizard__activities-list"
          >
            <WizardSubEventItem
              v-for="(se, index) in subEvents"
              :key="se.id"
              :model-value="se"
              @update:model-value="(val) => updateActivity(index, val)"
              @remove="removeActivity(index)"
            />
          </VueDraggable>

          <div v-else class="wizard__activities-empty">
            <Icon name="lucide:layers" size="24" />
            <AppText size="sm" muted>{{ t('dashboard.eventEditor.noSubEvents') }}</AppText>
          </div>

          <div class="wizard__activity-actions">
            <AppButton variant="ghost" size="sm" @click="addActivity">
              <Icon name="lucide:plus" size="14" />
              {{ t('wizard.addActivity') }}
            </AppButton>
            <button
              type="button"
              class="wizard__ai-btn"
              :disabled="loadingSubEvents"
              @click="onSuggestActivities"
            >
              <Icon name="lucide:sparkles" size="12" :class="{ 'wizard__spinner': loadingSubEvents }" />
              {{ loadingSubEvents ? t('editor.ai.loading') : t('wizard.aiSuggestActivities') }}
            </button>
          </div>

          <div v-if="subEventSuggestions.length > 0" class="wizard__ai-suggestions">
            <TransitionGroup name="chip-list" tag="div" class="wizard__chips">
              <AiSuggestionChip
                v-for="(suggestion, index) in subEventSuggestions"
                :key="suggestion.title"
                :label="suggestion.title"
                :subtitle="suggestion.durationMinutes ? `${suggestion.durationMinutes} min` : ''"
                @accept="acceptSubEventSuggestion(suggestion)"
                @dismiss="dismissSubEventSuggestion(index)"
              />
            </TransitionGroup>
            <button
              v-if="subEventSuggestions.length > 1"
              type="button"
              class="wizard__accept-all"
              @click="acceptAllSubEventSuggestions"
            >
              <Icon name="lucide:check-check" size="12" />
              {{ t('editor.ai.acceptAll') }}
            </button>
          </div>
        </div>
      </template>

      <!-- Step 4: Tier Selection -->
      <template #tier>
        <div class="wizard__step">
          <TierSelector
            v-model="selectedTier"
            :subscription-tier="subscriptionTier"
          />

          <div v-if="error" class="wizard__error">
            <Icon name="lucide:alert-circle" size="14" />
            {{ error }}
          </div>

          <AppButton
            variant="gradient"
            size="lg"
            :disabled="creating || !title.trim()"
            class="wizard__create-btn"
            @click="createEvent"
          >
            <Icon v-if="!creating" name="lucide:sparkles" size="16" />
            <Icon v-else name="lucide:loader-2" size="16" class="wizard__spinner" />
            {{ creating ? t('wizard.creating') : t('wizard.createEvent') }}
          </AppButton>
        </div>
      </template>
    </UStepper>

    <!-- Navigation -->
    <div class="wizard__nav">
      <AppButton
        variant="ghost"
        size="sm"
        :disabled="!stepper?.hasPrev"
        @click="stepper?.prev()"
      >
        <Icon name="lucide:arrow-left" size="14" />
        {{ t('wizard.prev') }}
      </AppButton>
      <AppButton
        v-if="stepper?.hasNext"
        variant="primary"
        size="sm"
        @click="stepper?.next()"
      >
        {{ t('wizard.next') }}
        <Icon name="lucide:arrow-right" size="14" />
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.wizard {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  max-width: 640px;
  margin: 0 auto;
}

.wizard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wizard__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.wizard__close:hover {
  background: var(--color-background-alt);
  color: var(--color-text-primary);
}

.wizard__stepper {
  width: 100%;
}

.wizard__step {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) 0;
}

/* Type grid */
.wizard__type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.wizard__skip {
  display: block;
  margin: 0 auto;
  padding: var(--space-2) var(--space-4);
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.wizard__skip:hover {
  color: var(--color-text-secondary);
}

/* Info fields */
.wizard__title-input {
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

.wizard__title-input:focus {
  border-color: var(--color-accent);
}

.wizard__title-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.wizard__field-row {
  display: flex;
  gap: var(--space-4);
}

.wizard__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.wizard__field--half {
  flex: 1;
}

.wizard__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.wizard__input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.wizard__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.wizard__input::placeholder {
  color: var(--color-text-muted);
}

/* AI elements */
.wizard__ai-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.wizard__ai-btn {
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

.wizard__ai-btn:hover:not(:disabled) {
  background: var(--color-accent-bg);
  box-shadow: var(--shadow-accent-sm);
}

.wizard__ai-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.wizard__spinner {
  animation: spin 1s linear infinite;
}

.wizard__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.wizard__activity-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.wizard__ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.wizard__accept-all {
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

.wizard__accept-all:hover {
  opacity: 1;
}

/* Chip transitions */
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

/* Activities */
.wizard__activities-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.wizard__activities-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
}

/* Tier step */
.wizard__error {
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

.wizard__create-btn {
  align-self: center;
  min-width: 200px;
}

.wizard__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Navigation */
.wizard__nav {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-light);
}

@media (max-width: 640px) {
  .wizard__type-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .wizard__field-row {
    flex-direction: column;
  }

  .wizard {
    padding: var(--space-4);
  }
}
</style>
