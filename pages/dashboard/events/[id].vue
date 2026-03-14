<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const route = useRoute()

const {
  eventData,
  fetchError,
  form,
  canEdit,
  saving,
  saved,
  saveError,
  isDirty,
  save,
  errors,
  touched,
  markTouched,
  completionPercent,
  completionItems,
} = useEventEditorProvider(route.params.id)

const { dataAttr } = useEventTheme(computed(() => form.eventType))

// Tabs
const tabs = computed(() => [
  { label: t('editor.tabs.details'), icon: 'i-lucide-file-text', slot: 'details' },
  { label: t('editor.tabs.schedule'), icon: 'i-lucide-calendar-clock', slot: 'schedule' },
  { label: t('editor.tabs.guests'), icon: 'i-lucide-users', slot: 'guests' },
  { label: t('editor.tabs.settings'), icon: 'i-lucide-settings', slot: 'settings' },
])

// Confetti on new event
const showConfetti = ref(false)
onMounted(() => {
  if (route.query.new) {
    showConfetti.value = true
    setTimeout(() => { showConfetti.value = false }, 2000)
  }
})

// Record view
onMounted(() => {
  $fetch(`/api/events/${route.params.id}/views`, { method: 'POST' }).catch(() => {})
})

// Tab change animations
const { animateTabChange } = useEditorAnimations()
const previousTab = ref(0)

function onTabChange(index) {
  const direction = index > previousTab.value ? 'right' : 'left'
  previousTab.value = index
  nextTick(() => {
    const tabContent = document.querySelector('.event-editor__tab-content')
    if (tabContent) animateTabChange(tabContent, direction)
  })
}
</script>

<template>
  <div class="event-editor" :data-event-type="dataAttr">
    <ConfettiExplosion :trigger="showConfetti" />

    <!-- Error state -->
    <div v-if="fetchError" class="event-editor__error-page">
      <Icon name="lucide:shield" size="32" />
      <AppHeading :level="2">
        {{ fetchError.statusCode === 404 ? t('dashboard.eventEditor.notFound') : t('dashboard.eventEditor.noAccess') }}
      </AppHeading>
      <AppButton variant="primary" to="/dashboard">{{ t('dashboard.backToDashboard') }}</AppButton>
    </div>

    <template v-else-if="eventData">
      <!-- Completion bar -->
      <EventCompletionBar
        :percent="completionPercent"
        :items="completionItems"
      />

      <!-- Cover image -->
      <CoverImageUploader
        :event-id="eventData.id"
        :current-image="eventData.coverImageUrl"
        :editable="canEdit"
        @updated="(url) => eventData.coverImageUrl = url"
      />

      <!-- Notion-style title -->
      <input
        v-model="form.title"
        type="text"
        class="event-editor__title-input"
        :class="{ 'event-editor__title-input--error': errors.title && touched.title }"
        :placeholder="t('dashboard.eventEditor.titlePlaceholder')"
        @blur="markTouched('title')"
      />
      <EditorFieldError
        :message="errors.title"
        :visible="!!(errors.title && touched.title)"
      />

      <!-- Tabbed content -->
      <UTabs :items="tabs" class="event-editor__tabs" @update:model-value="onTabChange">
        <template #details>
          <div class="event-editor__tab-content">
            <EditorDetailsTab />
          </div>
        </template>

        <template #schedule>
          <div class="event-editor__tab-content">
            <EditorScheduleTab />
          </div>
        </template>

        <template #guests>
          <div class="event-editor__tab-content">
            <EditorGuestsTab />
          </div>
        </template>

        <template #settings>
          <div class="event-editor__tab-content">
            <EditorSettingsTab />
          </div>
        </template>
      </UTabs>

      <!-- AI Assistant FAB (paid users only) -->
      <AiAssistantFab
        :locked="!eventData?.features?.aiAssistant"
      />

      <!-- Sticky save bar -->
      <div class="event-editor__save-bar">
        <div class="event-editor__save-bar-inner">
          <div class="event-editor__save-left">
            <AppButton
              :variant="isDirty ? 'gradient' : 'primary'"
              size="sm"
              :disabled="saving || !form.title.trim()"
              @click="save"
            >
              {{ saving ? t('dashboard.eventEditor.saving') : t('dashboard.eventEditor.save') }}
            </AppButton>
            <AutoSaveIndicator
              :saving="saving"
              :saved="saved"
              :is-dirty="isDirty"
              :error="saveError"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.event-editor {
  max-width: 720px;
}

.event-editor__error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-16) 0;
  color: var(--color-text-muted);
  text-align: center;
}

/* Notion-style title */
.event-editor__title-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  padding: var(--space-2) 0;
  margin-top: var(--space-4);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.event-editor__title-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.event-editor__title-input:focus {
  border-bottom: 2px solid var(--color-accent);
  margin-bottom: -2px;
}

.event-editor__title-input--error {
  border-bottom: 2px solid var(--color-error);
  margin-bottom: -2px;
}

.event-editor__title-input--error:focus {
  border-bottom-color: var(--color-error);
}

/* Tabs */
.event-editor__tabs {
  margin-top: var(--space-6);
}

.event-editor__tab-content {
  padding: var(--space-6) 0;
}

/* Sticky save bar */
.event-editor__save-bar {
  position: sticky;
  bottom: 0;
  margin-top: var(--space-8);
  margin-left: calc(-1 * var(--space-6));
  margin-right: calc(-1 * var(--space-6));
  padding: 0 var(--space-6);
}

.event-editor__save-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}

.event-editor__save-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

@media (max-width: 640px) {
  .event-editor__save-bar-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
