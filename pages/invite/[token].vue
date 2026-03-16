<script setup>
definePageMeta({ layout: false })

const { t, locale } = useI18n()
const route = useRoute()
const token = String(route.params.token)

const { data, error } = await useFetch(`/api/invite/${token}`)

const eventData = computed(() => data.value?.event || null)
const invitation = computed(() => data.value?.invitation || null)
const subEvents = computed(() => data.value?.subEvents || [])

const rsvpLoading = ref(false)
const rsvpStatus = ref(invitation.value?.status || 'pending')

const eventTypeColorMap = {
  birthday: '#9b59b6',
  wedding: '#e91e63',
  dinner: '#ff9800',
  baby_shower: '#4caf50',
  corporate: '#2196f3',
  other: '#6c7a89',
}

const accentColor = computed(() => {
  return eventTypeColorMap[eventData.value?.eventType] || 'var(--color-accent)'
})

const formattedDate = computed(() => {
  if (!eventData.value?.eventDate) return null
  const d = new Date(eventData.value.eventDate)
  const loc = locale.value === 'nl' ? 'nl-NL' : 'en-GB'
  return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const formattedTime = computed(() => {
  if (!eventData.value?.eventDate) return null
  const d = new Date(eventData.value.eventDate)
  return d.toLocaleTimeString(locale.value === 'nl' ? 'nl-NL' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
})

const hasPoll = computed(() => eventData.value?.features?.datePolling)
const isPlusOne = computed(() => !!invitation.value?.invitedById)
const invitedByName = computed(() => invitation.value?.invitedByName || '')
const remainingPlusOnes = computed(() => {
  const inv = invitation.value
  if (!inv) return 0
  const filled = inv.plusOneInvites?.length || 0
  return Math.max(0, (inv.plusOnes || 0) - filled)
})
const plusOneInvites = computed(() => invitation.value?.plusOneInvites || [])

// Plus-one add form
const showPlusOneForm = ref(false)
const plusOneName = ref('')
const plusOneEmail = ref('')
const plusOneSaving = ref(false)
const copiedPlusOneId = ref(null)

function plusOneLink(accessToken) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/invite/${accessToken}`
}

async function copyPlusOneLink(accessToken, id) {
  try {
    await navigator.clipboard.writeText(plusOneLink(accessToken))
    copiedPlusOneId.value = id
    setTimeout(() => { copiedPlusOneId.value = null }, 2000)
  } catch {}
}

async function addPlusOne() {
  if (!plusOneName.value.trim() || !plusOneEmail.value.trim()) return
  plusOneSaving.value = true
  try {
    const result = await $fetch(`/api/invite/${token}/plus-one`, {
      method: 'POST',
      body: { name: plusOneName.value.trim(), email: plusOneEmail.value.trim() },
    })
    plusOneName.value = ''
    plusOneEmail.value = ''
    showPlusOneForm.value = false
    // Refresh data to show the new plus-one in the list
    const refreshed = await $fetch(`/api/invite/${token}`)
    data.value = refreshed
    // Auto-copy the new link
    if (result.accessToken) {
      copyPlusOneLink(result.accessToken, result.id)
    }
  } finally {
    plusOneSaving.value = false
  }
}

async function removePlusOne(plusOneId) {
  try {
    await $fetch(`/api/invite/${token}/plus-one/${plusOneId}`, { method: 'DELETE' })
    const refreshed = await $fetch(`/api/invite/${token}`)
    data.value = refreshed
  } catch {}
}

async function rsvp(status) {
  rsvpLoading.value = true
  try {
    const result = await $fetch(`/api/invite/${token}/rsvp`, {
      method: 'POST',
      body: { status },
    })
    rsvpStatus.value = result.status
  } finally {
    rsvpLoading.value = false
  }
}

// Watch for initial data
watch(invitation, (inv) => {
  if (inv) rsvpStatus.value = inv.status
}, { immediate: true })
</script>

<template>
  <div class="invite-page" :style="{ '--event-accent': accentColor }">
    <!-- Error state -->
    <div v-if="error" class="invite-page__error">
      <div class="invite-page__error-card">
        <Icon name="lucide:alert-circle" size="48" class="invite-page__error-icon" />
        <AppHeading :level="1" size="lg">{{ t('invite.error.title') }}</AppHeading>
        <AppText muted>{{ t('invite.error.description') }}</AppText>
        <NuxtLink to="/" class="invite-page__error-link">
          <AppButton variant="outline" size="sm">{{ t('invite.error.backHome') }}</AppButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Main content -->
    <template v-else-if="eventData">
      <!-- Hero -->
      <header class="invite-page__hero">
        <div
          v-if="eventData.coverImageUrl"
          class="invite-page__hero-bg"
          :style="{ backgroundImage: `url(${eventData.coverImageUrl})` }"
        />
        <div v-else class="invite-page__hero-bg invite-page__hero-bg--gradient" />
        <div class="invite-page__hero-overlay" />

        <div class="invite-page__hero-content">
          <div class="invite-page__logo">
            <NuxtLink to="/" class="invite-page__logo-link">Fishionaire</NuxtLink>
          </div>

          <div class="invite-page__hero-text">
            <div v-if="eventData.eventType" class="invite-page__type-badge">
              {{ t(`dashboard.eventEditor.eventTypes.${eventData.eventType}`) }}
            </div>
            <h1 class="invite-page__title">{{ eventData.title }}</h1>
            <div class="invite-page__meta">
              <span v-if="formattedDate" class="invite-page__meta-item">
                <Icon name="lucide:calendar" size="16" />
                {{ formattedDate }}
                <span v-if="formattedTime" class="invite-page__meta-time">{{ formattedTime }}</span>
              </span>
              <span v-else-if="hasPoll" class="invite-page__meta-item invite-page__meta-item--poll">
                <Icon name="lucide:bar-chart-3" size="16" />
                {{ t('invite.dateToBeDecided') }}
              </span>
              <span v-if="eventData.location" class="invite-page__meta-item">
                <Icon name="lucide:map-pin" size="16" />
                {{ eventData.location }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Body -->
      <main class="invite-page__body">
        <!-- Welcome -->
        <section class="invite-page__card invite-page__welcome" style="animation-delay: 100ms">
          <div class="invite-page__welcome-icon">
            <Icon :name="isPlusOne ? 'lucide:user-plus' : 'lucide:party-popper'" size="28" />
          </div>
          <h2 class="invite-page__welcome-text">
            <template v-if="isPlusOne">
              {{ t('invite.welcomePlusOne', { event: eventData.title, inviter: invitedByName }) }}
            </template>
            <template v-else-if="invitation?.inviteeName">
              {{ t('invite.welcomeNamed', { name: invitation.inviteeName }) }}
            </template>
            <template v-else>
              {{ t('invite.welcome') }}
            </template>
          </h2>
          <AppText v-if="isPlusOne && invitedByName" size="sm" muted class="invite-page__plus-one-context">
            <Icon name="lucide:heart" size="14" />
            {{ t('invite.plusOneContext', { name: invitedByName }) }}
          </AppText>
          <AppText v-if="eventData.description" class="invite-page__description">
            {{ eventData.description }}
          </AppText>
        </section>

        <!-- RSVP -->
        <section class="invite-page__card invite-page__rsvp" style="animation-delay: 200ms">
          <h3 class="invite-page__section-title">{{ t('invite.rsvp.title') }}</h3>

          <div v-if="rsvpStatus !== 'pending'" class="invite-page__rsvp-status">
            <div
              class="invite-page__rsvp-badge"
              :class="{
                'invite-page__rsvp-badge--accepted': rsvpStatus === 'accepted',
                'invite-page__rsvp-badge--declined': rsvpStatus === 'declined',
              }"
            >
              <Icon :name="rsvpStatus === 'accepted' ? 'lucide:check-circle' : 'lucide:x-circle'" size="20" />
              {{ rsvpStatus === 'accepted' ? t('invite.rsvp.youreAttending') : t('invite.rsvp.youreNotAttending') }}
            </div>
            <button class="invite-page__change-btn" @click="rsvpStatus = 'pending'">
              {{ t('invite.rsvp.changeResponse') }}
            </button>
          </div>

          <div v-else class="invite-page__rsvp-buttons">
            <button
              class="invite-page__rsvp-btn invite-page__rsvp-btn--accept"
              :disabled="rsvpLoading"
              @click="rsvp('accepted')"
            >
              <Icon name="lucide:check" size="20" />
              {{ t('invite.rsvp.attending') }}
            </button>
            <button
              class="invite-page__rsvp-btn invite-page__rsvp-btn--decline"
              :disabled="rsvpLoading"
              @click="rsvp('declined')"
            >
              <Icon name="lucide:x" size="20" />
              {{ t('invite.rsvp.declining') }}
            </button>
          </div>

          <AppText v-if="invitation?.plusOnes > 0 && !isPlusOne" size="sm" muted class="invite-page__plus-ones-note">
            <Icon name="lucide:user-plus" size="14" />
            {{ t('invite.rsvp.plusOnesNote', { count: invitation.plusOnes }) }}
          </AppText>
        </section>

        <!-- Plus-one management (only for primary invitees with plus-one slots) -->
        <section
          v-if="!isPlusOne && invitation?.plusOnes > 0"
          class="invite-page__card invite-page__plus-ones-section"
          style="animation-delay: 250ms"
        >
          <h3 class="invite-page__section-title">{{ t('invite.plusOnes.title') }}</h3>
          <AppText size="sm" muted>{{ t('invite.plusOnes.subtitle', { count: invitation.plusOnes }) }}</AppText>

          <!-- List of already-added plus-ones -->
          <div v-if="plusOneInvites.length > 0" class="invite-page__plus-one-list">
            <div v-for="po in plusOneInvites" :key="po.id" class="invite-page__plus-one-row">
              <div class="invite-page__plus-one-avatar">
                {{ (po.inviteeName || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="invite-page__plus-one-info">
                <span class="invite-page__plus-one-name">{{ po.inviteeName }}</span>
                <span class="invite-page__plus-one-email">{{ po.inviteeEmail }}</span>
              </div>
              <AppBadge :variant="po.status === 'accepted' ? 'success' : po.status === 'declined' ? 'error' : 'default'" size="sm">
                {{ t(`editor.guests.status.${po.status}`) }}
              </AppBadge>
              <div class="invite-page__plus-one-actions-row">
                <button
                  class="invite-page__copy-link-btn"
                  :title="t('invite.plusOnes.copyLink')"
                  @click="copyPlusOneLink(po.accessToken, po.id)"
                >
                  <Icon :name="copiedPlusOneId === po.id ? 'lucide:check' : 'lucide:link'" size="14" />
                </button>
                <button
                  class="invite-page__copy-link-btn invite-page__copy-link-btn--danger"
                  :title="t('invite.plusOnes.remove')"
                  @click="removePlusOne(po.id)"
                >
                  <Icon name="lucide:x" size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Add plus-one form -->
          <div v-if="remainingPlusOnes > 0 && showPlusOneForm" class="invite-page__plus-one-form">
            <input
              v-model="plusOneName"
              type="text"
              class="invite-page__plus-one-input"
              :placeholder="t('invite.plusOnes.namePlaceholder')"
            />
            <input
              v-model="plusOneEmail"
              type="email"
              class="invite-page__plus-one-input"
              :placeholder="t('invite.plusOnes.emailPlaceholder')"
            />
            <div class="invite-page__plus-one-actions">
              <AppButton
                variant="primary"
                size="sm"
                :loading="plusOneSaving"
                :disabled="!plusOneName.trim() || !plusOneEmail.trim()"
                @click="addPlusOne"
              >
                <Icon name="lucide:link" size="14" />
                {{ t('invite.plusOnes.createLink') }}
              </AppButton>
              <AppButton variant="ghost" size="sm" @click="showPlusOneForm = false">
                {{ t('common.cancel') }}
              </AppButton>
            </div>
          </div>

          <AppButton
            v-if="remainingPlusOnes > 0 && !showPlusOneForm"
            variant="outline"
            size="sm"
            @click="showPlusOneForm = true"
          >
            <Icon name="lucide:user-plus" size="14" />
            {{ t('invite.plusOnes.addButton') }}
            <span class="invite-page__remaining">({{ remainingPlusOnes }} {{ t('invite.plusOnes.remaining') }})</span>
          </AppButton>
        </section>

        <!-- Programme (sub-events the guest is invited to) -->
        <section v-if="subEvents.length > 0" class="invite-page__card invite-page__programme" style="animation-delay: 300ms">
          <h3 class="invite-page__section-title">{{ t('invite.programme.title') }}</h3>
          <div class="invite-page__programme-list">
            <div
              v-for="se in subEvents"
              :key="se.id"
              class="invite-page__programme-item"
            >
              <div class="invite-page__programme-dot" />
              <div class="invite-page__programme-info">
                <span class="invite-page__programme-name">{{ se.title }}</span>
                <span v-if="se.description" class="invite-page__programme-desc">{{ se.description }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Date poll voting -->
        <section v-if="hasPoll" class="invite-page__card invite-page__poll" style="animation-delay: 400ms">
          <h3 class="invite-page__section-title">{{ t('invite.poll.title') }}</h3>
          <AppText size="sm" muted>{{ t('invite.poll.subtitle') }}</AppText>
          <DatePollVotingForm
            :event-id="parseInt(eventData.id)"
            :initial-email="invitation?.inviteeEmail || ''"
            :event-title="eventData.title"
          />
        </section>
      </main>

      <!-- Footer -->
      <footer class="invite-page__footer">
        <AppText size="xs" muted>
          Powered by <NuxtLink to="/" class="invite-page__footer-link">Fishionaire</NuxtLink>
        </AppText>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.invite-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg, var(--color-background));
}

/* ── Hero ────────────────────────────── */
.invite-page__hero {
  position: relative;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.invite-page__hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.invite-page__hero-bg--gradient {
  background: linear-gradient(135deg, var(--event-accent, var(--color-accent)), color-mix(in srgb, var(--event-accent, var(--color-accent)) 60%, #1a1a2e));
}

.invite-page__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.1) 100%);
}

.invite-page__hero-content {
  position: relative;
  z-index: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.invite-page__logo {
  opacity: 0.8;
}

.invite-page__logo-link {
  color: #fff;
  text-decoration: none;
  font-family: var(--font-family-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.02em;
}

.invite-page__hero-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 640px;
}

.invite-page__type-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.invite-page__title {
  font-family: var(--font-family-heading);
  font-size: clamp(var(--text-2xl), 5vw, var(--text-4xl));
  font-weight: var(--font-weight-bold);
  color: #fff;
  line-height: var(--line-height-tight);
  margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.invite-page__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.invite-page__meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--text-sm);
}

.invite-page__meta-time {
  opacity: 0.7;
}

.invite-page__meta-item--poll {
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

/* ── Body ────────────────────────────── */
.invite-page__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  margin-top: calc(-1 * var(--space-4));
  position: relative;
  z-index: 2;
}

.invite-page__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  animation: fadeInUp 500ms ease-out both;
}

/* ── Welcome ─────────────────────────── */
.invite-page__welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
}

.invite-page__welcome-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--event-accent, var(--color-accent)), color-mix(in srgb, var(--event-accent, var(--color-accent)) 70%, #6c5ce7));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-page__welcome-text {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.invite-page__description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  max-width: 480px;
}

/* ── RSVP ────────────────────────────── */
.invite-page__rsvp {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.invite-page__section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--event-accent, var(--color-accent));
  margin: 0;
}

.invite-page__rsvp-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.invite-page__rsvp-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.invite-page__rsvp-badge--accepted {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}

.invite-page__rsvp-badge--declined {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}

.invite-page__change-btn {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  cursor: pointer;
  text-decoration: underline;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.invite-page__change-btn:hover {
  opacity: 1;
}

.invite-page__rsvp-buttons {
  display: flex;
  gap: var(--space-3);
}

.invite-page__rsvp-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.invite-page__rsvp-btn--accept {
  color: var(--color-success);
}

.invite-page__rsvp-btn--accept:hover:not(:disabled) {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 8%, var(--color-surface));
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-success) 15%, transparent);
  transform: translateY(-1px);
}

.invite-page__rsvp-btn--decline {
  color: var(--color-text-muted);
}

.invite-page__rsvp-btn--decline:hover:not(:disabled) {
  border-color: var(--color-error);
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 5%, var(--color-surface));
}

.invite-page__rsvp-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.invite-page__plus-ones-note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
}

/* ── Plus-one context ────────────────── */
.invite-page__plus-one-context {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-accent-violet);
}

/* ── Plus-ones section ───────────────── */
.invite-page__plus-ones-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.invite-page__plus-one-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.invite-page__plus-one-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.invite-page__plus-one-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent-violet) 10%, transparent);
  color: var(--color-accent-violet);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.invite-page__plus-one-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.invite-page__plus-one-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.invite-page__plus-one-email {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.invite-page__copy-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.invite-page__copy-link-btn:hover {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}

.invite-page__copy-link-btn--danger:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}

.invite-page__plus-one-actions-row {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.invite-page__plus-one-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-accent-violet) 2%, var(--color-surface));
}

.invite-page__plus-one-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  outline: none;
  transition: border-color var(--transition-fast);
}

.invite-page__plus-one-input:focus {
  border-color: var(--color-accent-violet);
}

.invite-page__plus-one-actions {
  display: flex;
  gap: var(--space-2);
}

.invite-page__remaining {
  font-weight: var(--font-weight-normal);
  opacity: 0.6;
}

.invite-page__plus-one-success {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-success);
}

/* ── Programme ───────────────────────── */
.invite-page__programme {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.invite-page__programme-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-left: var(--space-2);
}

.invite-page__programme-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-2) 0;
}

.invite-page__programme-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--event-accent, var(--color-accent));
  margin-top: 6px;
  flex-shrink: 0;
}

.invite-page__programme-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.invite-page__programme-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.invite-page__programme-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* ── Date poll ───────────────────────── */
.invite-page__poll {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ── Error state ─────────────────────── */
.invite-page__error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.invite-page__error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
  max-width: 360px;
}

.invite-page__error-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
}

/* ── Footer ──────────────────────────── */
.invite-page__footer {
  padding: var(--space-6);
  text-align: center;
}

.invite-page__footer-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.invite-page__footer-link:hover {
  text-decoration: underline;
}

/* ── Animation ───────────────────────── */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Responsive ──────────────────────── */
@media (max-width: 640px) {
  .invite-page__hero {
    min-height: 280px;
  }

  .invite-page__hero-content {
    padding: var(--space-4);
  }

  .invite-page__body {
    padding: var(--space-4);
  }

  .invite-page__card {
    padding: var(--space-4);
    border-radius: var(--radius-lg);
  }

  .invite-page__rsvp-buttons {
    flex-direction: column;
  }
}
</style>
