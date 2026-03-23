<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const route = useRoute()

const {
  eventData,
  fetchError,
  refreshEvent,
  form,
  canEdit,
  saving,
  saved,
  saveError,
  isDirty,
  saveStatus,
  save,
  forceSave,
  errors,
  touched,
  markTouched,
  completionPercent,
  completionItems,
} = useEventEditorProvider(route.params.id)

const { dataAttr, styleOverrides } = useEventTheme(computed(() => form.eventType), computed(() => form.themeColor || null))

useHead({ title: () => form.title ? `${form.title} — Fishionaire Events` : t('seo.eventEditor.title') })

// Tabs
const tabs = computed(() => {
  const base = [
    { label: t('editor.tabs.details'), icon: 'i-lucide-file-text', slot: 'details' },
    { label: t('editor.tabs.schedule'), icon: 'i-lucide-calendar-clock', slot: 'schedule' },
    { label: t('editor.tabs.guests'), icon: 'i-lucide-users', slot: 'guests' },
  ]
  if (eventData.value?.features?.rsvp) {
    base.push({ label: t('editor.tabs.rsvp'), icon: 'i-lucide-check-circle', slot: 'rsvp' })
  }
  if (eventData.value?.features?.wishlist) {
    base.push({ label: t('editor.tabs.wishlist'), icon: 'i-lucide-gift', slot: 'wishlist' })
  }
  if (eventData.value?.features?.photoGallery) {
    base.push({ label: t('editor.tabs.photos'), icon: 'i-lucide-camera', slot: 'photos' })
  }
  if (eventData.value?.features?.budgetTracker) {
    base.push({ label: t('editor.tabs.budget'), icon: 'i-lucide-wallet', slot: 'budget' })
  }
  if (eventData.value?.features?.socialWall) {
    base.push({ label: t('editor.tabs.socialWall'), icon: 'i-lucide-message-circle-heart', slot: 'socialWall' })
  }
  if (eventData.value?.features?.checkIn) {
    base.push({ label: t('editor.tabs.checkIn'), icon: 'i-lucide-scan-line', slot: 'checkIn' })
  }
  base.push({ label: t('editor.tabs.settings'), icon: 'i-lucide-settings', slot: 'settings' })
  return base
})

// Keyboard shortcut: Cmd/Ctrl+S to force save
function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    forceSave()
  }
}
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

// Confetti on new event
const showConfetti = ref(false)
onMounted(() => {
  if (route.query.new) {
    showConfetti.value = true
    setTimeout(() => { showConfetti.value = false }, 2000)
  }
})

// Success banner after Stripe upgrade redirect
const showUpgradeSuccess = ref(false)
const router = useRouter()
onMounted(async () => {
  if (route.query.upgraded === 'true') {
    // Verify the Stripe session to ensure payment is processed
    // (fallback for when webhook hasn't fired yet)
    if (route.query.session_id) {
      try {
        await $fetch('/api/subscriptions/verify-session', {
          method: 'POST',
          body: { sessionId: route.query.session_id },
        })
      } catch {
        // Webhook may have already processed it
      }
    }
    await refreshEvent()
    showUpgradeSuccess.value = true
    router.replace({ query: {} })
    setTimeout(() => { showUpgradeSuccess.value = false }, 5000)
  }
})

// Record view
onMounted(() => {
  $fetch(`/api/events/${route.params.id}/views`, { method: 'POST' }).catch(() => {})
})

// Activity feed
const { data: activityData } = useFetch(() => `/api/events/${route.params.id}/activity`, { lazy: true })

const activityTypeConfig = {
  rsvp: { icon: 'check-circle', color: 'var(--color-success)' },
  claim: { icon: 'gift', color: 'var(--color-accent)' },
  purchase: { icon: 'shopping-bag', color: 'var(--color-success)' },
  music_request: { icon: 'music', color: 'var(--color-event-party)' },
  dietary: { icon: 'utensils', color: 'var(--color-event-dinner)' },
  plus_one: { icon: 'user-plus', color: 'var(--color-event-birthday)' },
  photo_upload: { icon: 'camera', color: 'var(--color-event-birthday)' },
  budget_expense: { icon: 'wallet', color: 'var(--color-accent)' },
  social_wall_post: { icon: 'message-circle', color: 'var(--color-event-birthday)' },
  check_in: { icon: 'scan-line', color: 'var(--color-success)' },
}

function formatTimeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('wishlist.chat.justNow')
  if (mins < 60) return t('wishlist.chat.minutesAgo', { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('wishlist.chat.hoursAgo', { count: hours })
  return new Date(date).toLocaleDateString()
}

function formatActivityMessage(log) {
  const name = log.actorName || log.actorEmail
  const meta = log.metadata || {}
  switch (log.type) {
    case 'rsvp': return `${name} ${meta.status === 'accepted' ? 'accepted' : 'declined'} ${meta.subEventTitle || ''}`
    case 'claim': return `${name} claimed ${meta.itemTitle || 'an item'}`
    case 'purchase': return `${name} purchased ${meta.itemTitle || 'an item'}`
    case 'music_request': return `${name} requested "${meta.songTitle || ''}"${meta.artist ? ` by ${meta.artist}` : ''}`
    case 'dietary': return `${name} submitted dietary preferences`
    case 'plus_one': return `${name} was added as a plus-one`
    case 'photo_upload': return `${name} uploaded a photo`
    case 'budget_expense': return `${name} added an expense`
    case 'social_wall_post': return `${name} posted on the Social Wall`
    case 'check_in': return `${name} checked in`
    default: return `${name} performed an action`
  }
}

const formattedActivities = computed(() => {
  if (!activityData.value) return []
  return activityData.value.map((log) => {
    const config = activityTypeConfig[log.type] || { icon: 'activity', color: 'var(--color-text-muted)' }
    return {
      icon: config.icon,
      color: config.color,
      message: formatActivityMessage(log),
      timestamp: formatTimeAgo(log.createdAt),
    }
  })
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
  <div class="event-editor" :data-event-type="dataAttr" :style="styleOverrides">
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
      <!-- Upgrade success banner -->
      <Transition name="fade">
        <div v-if="showUpgradeSuccess" class="event-editor__upgrade-success">
          <Icon name="lucide:check-circle" size="18" />
          <span>{{ t('editor.settings.upgradeSuccess') }}</span>
        </div>
      </Transition>

      <!-- Completion bar -->
      <ClientOnly>
        <EventCompletionBar
          :percent="completionPercent"
          :items="completionItems"
        />
      </ClientOnly>

      <!-- Cover image -->
      <CoverImageUploader
        :event-id="eventData.id"
        :current-image="eventData.coverImageUrl"
        :editable="canEdit"
        @updated="(url) => eventData.coverImageUrl = url"
      />

      <!-- Notion-style title + save status -->
      <div class="event-editor__title-row">
        <input
          v-model="form.title"
          type="text"
          class="event-editor__title-input"
          :class="{ 'event-editor__title-input--error': errors.title && touched.title }"
          :placeholder="t('dashboard.eventEditor.titlePlaceholder')"
          @blur="markTouched('title')"
        />
        <SaveStatusIndicator :status="saveStatus" />
      </div>
      <EditorFieldError
        :message="errors.title"
        :visible="!!(errors.title && touched.title)"
      />

      <!-- Tabbed content -->
      <AppTabs :items="tabs" :model-value="previousTab" class="event-editor__tabs" @update:model-value="onTabChange">
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

        <template v-if="eventData?.features?.rsvp" #rsvp>
          <div class="event-editor__tab-content">
            <EditorRsvpTab />
          </div>
        </template>

        <template v-if="eventData?.features?.wishlist" #wishlist>
          <div class="event-editor__tab-content">
            <EditorWishlistTab
              :event-id="eventData.id"
              :event-type="form.eventType"
              :event-title="form.title"
              :features="eventData.features"
            />
          </div>
        </template>

        <template v-if="eventData?.features?.photoGallery" #photos>
          <div class="event-editor__tab-content">
            <EditorPhotosTab
              :event-id="eventData.id"
              :features="eventData.features"
            />
          </div>
        </template>

        <template v-if="eventData?.features?.budgetTracker" #budget>
          <div class="event-editor__tab-content">
            <EditorBudgetTab
              :event-id="eventData.id"
              :features="eventData.features"
            />
          </div>
        </template>

        <template v-if="eventData?.features?.socialWall" #socialWall>
          <div class="event-editor__tab-content">
            <EditorSocialWallTab
              :event-id="eventData.id"
              :features="eventData.features"
              :auto-approve="eventData.socialWallAutoApprove"
            />
          </div>
        </template>

        <template v-if="eventData?.features?.checkIn" #checkIn>
          <div class="event-editor__tab-content">
            <EditorCheckInTab
              :event-id="eventData.id"
              :features="eventData.features"
            />
          </div>
        </template>

        <template #settings>
          <div class="event-editor__tab-content">
            <EditorSettingsTab />
          </div>
        </template>
      </AppTabs>

      <!-- Activity feed -->
      <ActivityFeed :activities="formattedActivities" />

      <!-- AI Assistant FAB (paid users only) -->
      <AiAssistantFab
        :locked="!eventData?.features?.aiAssistant"
      />

      <!-- Sticky save bar -->
      <ClientOnly>
        <EditorSaveBar
          :saving="saving"
          :saved="saved"
          :is-dirty="isDirty"
          :error="saveError"
          :disabled="!form.title.trim()"
          :save-label="t('dashboard.eventEditor.save')"
          :saving-label="t('dashboard.eventEditor.saving')"
          @save="save"
        />
      </ClientOnly>
    </template>
  </div>
</template>

<style scoped>
.event-editor {
  max-width: 860px;
  margin: 0 auto;
  transition: --color-accent 0.4s ease, --color-accent-light 0.4s ease, --color-accent-dark 0.4s ease, --color-accent-bg 0.4s ease, --color-accent-dim 0.4s ease;
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
.event-editor__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.event-editor__title-input {
  flex: 1;
  min-width: 0;
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

/* Upgrade success */
.event-editor__upgrade-success {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  color: var(--color-success);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Tabs */
.event-editor__tabs {
  margin-top: var(--space-6);
}

.event-editor__tab-content {
  padding: var(--space-6) 0;
}

</style>
