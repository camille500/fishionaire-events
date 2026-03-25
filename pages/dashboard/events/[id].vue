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

// Tabs — always show all tabs, mark locked ones
const tabs = computed(() => {
  const features = eventData.value?.features || {}

  function tab(label, icon, slot, { feature, tier } = {}) {
    const unlocked = feature ? features[feature] : true
    return {
      label: t(`editor.tabs.${label}`),
      icon: `i-lucide-${icon}`,
      slot,
      locked: !unlocked,
      tierBadge: !unlocked ? t(`tiers.${tier || 'standard'}`) : undefined,
      requiredTier: !unlocked ? (tier || 'standard') : undefined,
    }
  }

  return [
    tab('details', 'file-text', 'details'),
    tab('schedule', 'calendar-clock', 'schedule'),
    tab('guests', 'users', 'guests'),
    tab('responses', 'check-circle', 'responses', { feature: 'rsvp', tier: 'standard' }),
    tab('wishlist', 'gift', 'wishlist', { feature: 'wishlist', tier: 'standard' }),
    tab('photos', 'camera', 'photos', { feature: 'photoGallery', tier: 'standard' }),
    tab('budget', 'wallet', 'budget', { feature: 'budgetTracker', tier: 'pro' }),
    tab('socialWall', 'message-circle-heart', 'socialWall', { feature: 'socialWall', tier: 'standard' }),
    tab('checkIn', 'scan-line', 'checkIn', { feature: 'checkIn', tier: 'standard' }),
    tab('theme', 'palette', 'theme', { feature: 'customTheme', tier: 'pro' }),
    tab('settings', 'settings', 'settings'),
  ]
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

// Unsaved changes guard
const showLeaveModal = ref(false)
let pendingNavigation = null

onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    pendingNavigation = { to, next }
    showLeaveModal.value = true
    next(false)
  } else {
    next()
  }
})

function handleBeforeUnload(e) {
  if (isDirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => window.addEventListener('beforeunload', handleBeforeUnload))
onUnmounted(() => window.removeEventListener('beforeunload', handleBeforeUnload))

async function saveAndLeave() {
  await forceSave()
  showLeaveModal.value = false
  if (pendingNavigation) {
    navigateTo(pendingNavigation.to.fullPath)
    pendingNavigation = null
  }
}

function leaveWithoutSaving() {
  showLeaveModal.value = false
  if (pendingNavigation) {
    pendingNavigation.next()
    pendingNavigation = null
  }
}

// Sidebar navigation
const { editorSidebarOpen, isMobile, closeEditorSidebar } = useEditorSidebar()
const { animateTabChangeVertical } = useEditorAnimations()
const activeTab = ref(0)

const tabSections = computed(() => [
  { label: t('editor.sections.core'), startIndex: 0 },
  { label: t('editor.sections.people'), startIndex: 2 },
  { label: t('editor.sections.features'), startIndex: 4 },
  { label: t('editor.sections.appearance'), startIndex: 9 },
])

function onTabChange(index) {
  const direction = index > activeTab.value ? 'down' : 'up'
  activeTab.value = index
  if (isMobile.value) closeEditorSidebar()
  nextTick(() => {
    const tabContent = document.querySelector('.event-editor__tab-content')
    if (tabContent) animateTabChangeVertical(tabContent, direction)
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

      <!-- Two-column body: sidebar + content -->
      <div class="event-editor__body">
        <!-- Mobile sidebar toggle -->
        <button
          v-if="isMobile"
          type="button"
          class="event-editor__sidebar-toggle"
          @click="editorSidebarOpen = !editorSidebarOpen"
        >
          <Icon name="lucide:panel-left" size="18" />
        </button>

        <!-- Mobile backdrop -->
        <Transition name="backdrop">
          <div
            v-if="isMobile && editorSidebarOpen"
            class="event-editor__sidebar-backdrop"
            @click="closeEditorSidebar"
          />
        </Transition>

        <!-- Editor sidebar nav -->
        <aside
          class="event-editor__sidebar"
          :class="{ 'event-editor__sidebar--open': editorSidebarOpen }"
        >
          <EditorSidebarNav
            :items="tabs"
            :model-value="activeTab"
            :sections="tabSections"
            @update:model-value="onTabChange"
          >
            <template #locked-popover="{ item }">
              <EventUpgradePanel @close="() => {}" @upgraded="refreshEvent" />
            </template>
          </EditorSidebarNav>
        </aside>

        <!-- Content panels -->
        <div class="event-editor__content">
          <div v-show="activeTab === 0" class="event-editor__tab-content">
            <EditorDetailsTab />
          </div>

          <div v-show="activeTab === 1" class="event-editor__tab-content">
            <EditorScheduleTab />
          </div>

          <div v-show="activeTab === 2" class="event-editor__tab-content">
            <EditorGuestsTab />
          </div>

          <div v-show="activeTab === 3 && !tabs[3]?.locked" class="event-editor__tab-content">
            <EditorResponsesTab />
          </div>

          <div v-show="activeTab === 4 && !tabs[4]?.locked" class="event-editor__tab-content">
            <EditorWishlistTab
              :event-id="eventData.id"
              :event-type="form.eventType"
              :event-title="form.title"
              :features="eventData.features"
            />
          </div>

          <div v-show="activeTab === 5 && !tabs[5]?.locked" class="event-editor__tab-content">
            <EditorPhotosTab
              :event-id="eventData.id"
              :features="eventData.features"
            />
          </div>

          <div v-show="activeTab === 6 && !tabs[6]?.locked" class="event-editor__tab-content">
            <EditorBudgetTab
              :event-id="eventData.id"
              :features="eventData.features"
            />
          </div>

          <div v-show="activeTab === 7 && !tabs[7]?.locked" class="event-editor__tab-content">
            <EditorSocialWallTab
              :event-id="eventData.id"
              :features="eventData.features"
              :auto-approve="eventData.socialWallAutoApprove"
            />
          </div>

          <div v-show="activeTab === 8 && !tabs[8]?.locked" class="event-editor__tab-content">
            <EditorCheckInTab
              :event-id="eventData.id"
              :features="eventData.features"
            />
          </div>

          <div v-show="activeTab === 9 && !tabs[9]?.locked" class="event-editor__tab-content">
            <EditorThemeTab />
          </div>

          <div v-show="activeTab === 10" class="event-editor__tab-content">
            <EditorSettingsTab />
          </div>

          <!-- Activity feed -->
          <ActivityFeed :activities="formattedActivities" />
        </div>
      </div>

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

    <!-- Unsaved changes modal -->
    <ConfirmModal
      :visible="showLeaveModal"
      :title="t('dashboard.eventEditor.unsavedChanges')"
      :message="t('dashboard.eventEditor.unsavedMessage')"
      :confirm-label="t('dashboard.eventEditor.saveAndLeave')"
      :cancel-label="t('dashboard.eventEditor.leaveWithout')"
      :loading="saving"
      @confirm="saveAndLeave"
      @close="leaveWithoutSaving"
    />
  </div>
</template>

<style scoped>
.event-editor {
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
  max-width: 860px;
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

/* ── Two-column body: sidebar + content ── */
.event-editor__body {
  display: grid;
  grid-template-columns: 210px 1fr;
  gap: var(--space-6);
  margin-top: var(--space-6);
  position: relative;
}

/* ── Editor sidebar ── */
.event-editor__sidebar {
  position: sticky;
  top: calc(var(--header-height) + var(--space-4));
  max-height: calc(100vh - var(--header-height) - var(--space-8));
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-light) transparent;
  padding-right: var(--space-2);
  border-right: 1px solid var(--color-border-light);
}

/* ── Content area ── */
.event-editor__content {
  min-width: 0;
  max-width: 860px;
}

.event-editor__tab-content {
  padding: var(--space-2) 0 var(--space-6) 0;
}

/* ── Mobile sidebar toggle ── */
.event-editor__sidebar-toggle {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.event-editor__sidebar-toggle:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

/* ── Mobile backdrop ── */
.event-editor__sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 29;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity var(--transition-base);
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .event-editor__body {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .event-editor__sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 240px;
    max-height: none;
    z-index: 30;
    background: var(--color-background);
    border-right: 1px solid var(--color-border-light);
    padding: var(--space-4) var(--space-3);
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    overflow-y: auto;
  }

  .event-editor__sidebar--open {
    transform: translateX(0);
  }

  .event-editor__content {
    max-width: none;
  }

  .event-editor__tab-content {
    padding: var(--space-4) 0;
  }
}
</style>
