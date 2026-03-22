<script setup>
const { t } = useI18n()

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const preferences = ref({})
const reminderSchedule = ref([])
const digestEnabled = ref(false)

const categories = [
  'event_reminders',
  'rsvp_updates',
  'wishlist_activity',
  'guest_activity',
  'system_announcements',
]

const reminderOptions = ['24h', '3d', '1w']

onMounted(async () => {
  try {
    const data = await $fetch('/api/notifications/preferences')
    preferences.value = data.preferences || {}
    reminderSchedule.value = data.reminderSchedule || []
    digestEnabled.value = data.digestEnabled || false
  } catch {
    error.value = t('dashboard.notifications.loadError', 'Failed to load preferences')
  } finally {
    loading.value = false
  }
})

function getEmail(category) {
  return preferences.value[category]?.email ?? false
}

function setEmail(category, value) {
  if (!preferences.value[category]) {
    preferences.value[category] = { inApp: true, email: false }
  }
  preferences.value[category].email = value
}

function toggleReminder(value) {
  const index = reminderSchedule.value.indexOf(value)
  if (index >= 0) {
    reminderSchedule.value.splice(index, 1)
  } else {
    reminderSchedule.value.push(value)
  }
}

async function save() {
  saving.value = true
  saved.value = false
  try {
    await $fetch('/api/notifications/preferences', {
      method: 'PUT',
      body: {
        preferences: preferences.value,
        reminderSchedule: reminderSchedule.value,
        digestEnabled: digestEnabled.value,
      },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch {
    error.value = t('dashboard.notifications.saveError', 'Failed to save preferences')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="notification-prefs">
    <p v-if="loading" class="notification-prefs__loading">
      {{ t('dashboard.aiSettings.loading') }}
    </p>
    <p v-else-if="error" class="notification-prefs__error">{{ error }}</p>
    <template v-else>
      <p class="notification-prefs__description">
        {{ t('dashboard.settings.notificationsDescription') }}
      </p>

      <div class="notification-prefs__section">
        <div class="notification-prefs__section-header">
          <span class="notification-prefs__col-label">{{ t('dashboard.settings.emailLabel') }}</span>
        </div>
        <NotificationPreferenceRow
          v-for="category in categories"
          :key="category"
          :category="category"
          :label="t(`dashboard.settings.categories.${category}.label`)"
          :description="t(`dashboard.settings.categories.${category}.description`)"
          :email="getEmail(category)"
          @update:email="setEmail(category, $event)"
        />
      </div>

      <div class="notification-prefs__section">
        <span class="notification-prefs__section-title">
          {{ t('dashboard.settings.reminderSchedule') }}
        </span>
        <p class="notification-prefs__section-desc">
          {{ t('dashboard.settings.reminderScheduleDescription') }}
        </p>
        <div class="notification-prefs__checkboxes">
          <label
            v-for="option in reminderOptions"
            :key="option"
            class="notification-prefs__checkbox-label"
          >
            <input
              type="checkbox"
              :checked="reminderSchedule.includes(option)"
              class="notification-prefs__checkbox"
              @change="toggleReminder(option)"
            />
            <span>{{ t(`dashboard.settings.reminder_${option}`) }}</span>
          </label>
        </div>
      </div>

      <div class="notification-prefs__actions">
        <AppButton variant="primary" size="sm" :disabled="saving" @click="save">
          {{ saving ? t('dashboard.settings.saving') : t('dashboard.settings.save') }}
        </AppButton>
        <span v-if="saved" class="notification-prefs__saved">
          {{ t('dashboard.settings.preferencesSaved') }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.notification-prefs {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.notification-prefs__loading,
.notification-prefs__error {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.notification-prefs__error {
  color: var(--color-error, #e74c3c);
}

.notification-prefs__description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.notification-prefs__section {
  display: flex;
  flex-direction: column;
}

.notification-prefs__section-header {
  display: flex;
  justify-content: flex-end;
  padding-bottom: var(--space-2);
}

.notification-prefs__col-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notification-prefs__section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.notification-prefs__section-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-3);
}

.notification-prefs__checkboxes {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.notification-prefs__checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding: var(--space-1) 0;
}

.notification-prefs__checkbox {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
}

.notification-prefs__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-2);
}

.notification-prefs__saved {
  font-size: var(--text-sm);
  color: var(--color-success, var(--color-accent));
  font-weight: var(--font-weight-medium);
}
</style>
