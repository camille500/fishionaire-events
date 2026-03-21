<script setup>
definePageMeta({ layout: 'dashboard' })

const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()

const currentLanguage = computed({
  get: () => locale.value,
  set: (val) => setLocale(val),
})

const { settings: aiSettings, loading: aiLoading, saving: aiSaving, error: aiError, fetchAccountSettings, saveAccountSettings } = useLlmSettings()

onMounted(() => {
  fetchAccountSettings()
})
</script>

<template>
  <div class="settings-page">
    <h1 class="settings-page__title">{{ t('dashboard.sidebar.settings') }}</h1>

    <div class="settings-page__section">
      <h2 class="settings-page__section-title">{{ t('dashboard.settings.language') }}</h2>
      <div class="settings-page__option">
        <label class="settings-page__label">
          <input
            v-model="currentLanguage"
            type="radio"
            value="nl"
            class="settings-page__radio"
          />
          <span class="settings-page__radio-label">Nederlands</span>
        </label>
        <label class="settings-page__label">
          <input
            v-model="currentLanguage"
            type="radio"
            value="en"
            class="settings-page__radio"
          />
          <span class="settings-page__radio-label">English</span>
        </label>
      </div>
    </div>

    <div class="settings-page__section">
      <h2 class="settings-page__section-title">{{ t('dashboard.aiSettings.title') }}</h2>
      <p v-if="aiLoading" class="settings-page__placeholder">{{ t('dashboard.aiSettings.loading') }}</p>
      <p v-else-if="aiError" class="settings-page__error">{{ aiError }}</p>
      <LlmSettingsForm
        v-else
        :settings="aiSettings"
        :saving="aiSaving"
        @update:settings="aiSettings = $event"
        @save="saveAccountSettings"
      />
    </div>

    <div class="settings-page__section">
      <h2 class="settings-page__section-title">{{ t('dashboard.settings.profile') }}</h2>
      <NuxtLink :to="localePath('dashboard') + '/profile'" class="settings-page__link">
        {{ t('dashboard.settings.editProfile') }}
        <Icon name="lucide:arrow-right" size="16" />
      </NuxtLink>
    </div>

    <div class="settings-page__section">
      <h2 class="settings-page__section-title">{{ t('dashboard.settings.notifications') }}</h2>
      <p class="settings-page__placeholder">{{ t('dashboard.settings.notificationsPlaceholder') }}</p>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 860px;
  margin: 0 auto;
}

.settings-page__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.settings-page__section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.settings-page__section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4);
}

.settings-page__option {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.settings-page__label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.settings-page__label:hover {
  background: var(--color-background);
}

.settings-page__radio-label {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.settings-page__placeholder {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.settings-page__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-accent);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: gap var(--transition-fast);
}

.settings-page__link:hover {
  gap: var(--space-3);
}

.settings-page__error {
  font-size: var(--text-sm);
  color: var(--color-error, #e74c3c);
  margin: 0;
}
</style>
