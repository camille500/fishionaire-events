<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const route = useRoute()

const { data: eventData, error: fetchError } = await useFetch(`/api/events/${route.params.id}`)

const form = reactive({
  title: eventData.value?.title || '',
  description: eventData.value?.description || '',
  features: eventData.value?.features || {},
})

watch(eventData, (val) => {
  if (val) {
    form.title = val.title || ''
    form.description = val.description || ''
    form.features = val.features || {}
  }
})

const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

async function save() {
  saving.value = true
  saveError.value = ''
  saved.value = false

  try {
    const result = await $fetch(`/api/events/${route.params.id}`, {
      method: 'PUT',
      body: {
        title: form.title,
        description: form.description,
        features: form.features,
      },
    })
    form.title = result.title
    form.description = result.description
    form.features = result.features
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) {
    saveError.value = e.data?.statusMessage || t('dashboard.eventEditor.errorSaving')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="event-editor">
      <AppButton variant="ghost" size="sm" to="/dashboard" class="event-editor__back">
        <Icon name="lucide:chevron-down" size="16" class="event-editor__back-icon" />
        {{ t('dashboard.backToDashboard') }}
      </AppButton>

      <div v-if="fetchError" class="event-editor__error-page">
        <Icon name="lucide:shield" size="32" />
        <AppHeading :level="2">
          {{ fetchError.statusCode === 404 ? t('dashboard.eventEditor.notFound') : t('dashboard.eventEditor.noAccess') }}
        </AppHeading>
        <AppButton variant="primary" to="/dashboard">{{ t('dashboard.backToDashboard') }}</AppButton>
      </div>

      <template v-else-if="eventData">
        <section class="event-editor__details">
          <AppHeading :level="1">{{ t('dashboard.eventEditor.title') }}</AppHeading>

          <div class="event-editor__field">
            <label class="event-editor__label" for="event-title">
              {{ t('dashboard.eventEditor.titleLabel') }}
            </label>
            <input
              id="event-title"
              v-model="form.title"
              type="text"
              class="event-editor__input"
              :placeholder="t('dashboard.eventEditor.titlePlaceholder')"
            />
          </div>

          <div class="event-editor__field">
            <label class="event-editor__label" for="event-description">
              {{ t('dashboard.eventEditor.descriptionLabel') }}
            </label>
            <textarea
              id="event-description"
              v-model="form.description"
              class="event-editor__textarea"
              rows="4"
              :placeholder="t('dashboard.eventEditor.descriptionPlaceholder')"
            />
            <AiDescriptionAssistant
              v-model="form.description"
              :event-title="form.title"
            />
          </div>
        </section>

        <AppDivider spacing="sm" />

        <section class="event-editor__features">
          <AppHeading :level="2" class="event-editor__section-title">
            {{ t('dashboard.eventEditor.featuresSection') }}
          </AppHeading>
          <AppText class="event-editor__section-subtitle">
            {{ t('dashboard.eventEditor.featuresSubtitle') }}
          </AppText>
          <FeatureTogglesGrid v-model="form.features" />
        </section>

        <div class="event-editor__save-bar">
          <AppButton
            variant="primary"
            :disabled="saving || !form.title.trim()"
            @click="save"
          >
            {{ saving ? t('dashboard.eventEditor.saving') : t('dashboard.eventEditor.save') }}
          </AppButton>
          <Transition name="fade">
            <span v-if="saved" class="event-editor__saved">
              <Icon name="lucide:check" size="16" />
              {{ t('dashboard.eventEditor.saved') }}
            </span>
          </Transition>
          <AppText v-if="saveError" size="sm" class="event-editor__save-error">
            {{ saveError }}
          </AppText>
        </div>
      </template>
    </div>
</template>

<style scoped>
.event-editor__back {
  margin-bottom: var(--space-6);
}

.event-editor__back-icon {
  transform: rotate(90deg);
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

.event-editor__details {
  margin-bottom: var(--space-2);
}

.event-editor__field {
  margin-top: var(--space-6);
}

.event-editor__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.event-editor__input,
.event-editor__textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
  outline: none;
}

.event-editor__input:focus,
.event-editor__textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15);
}

.event-editor__input::placeholder,
.event-editor__textarea::placeholder {
  color: var(--color-text-muted);
}

.event-editor__textarea {
  resize: vertical;
  min-height: 100px;
  line-height: var(--line-height-relaxed);
}

.event-editor__features {
  margin-top: var(--space-2);
}

.event-editor__section-title {
  font-size: var(--text-xl);
}

.event-editor__section-subtitle {
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

.event-editor__save-bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.event-editor__saved {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-success);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.event-editor__save-error {
  color: var(--color-accent-dark);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
