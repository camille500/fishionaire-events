<script setup>
definePageMeta({ layout: false })

const route = useRoute()
const { t, locale } = useI18n()
const { isSignedIn } = useAuth()
const shareToken = String(route.params.token)
const inviteToken = String(route.query.t || '')
const invitePin = String(route.query.pin || '')

// If guest arrived via invite link, fetch their invitation data first
const invitation = ref(null)
if (inviteToken) {
  try {
    const pinQuery = invitePin ? `?pin=${invitePin}` : ''
    const inviteData = await $fetch(`/api/invite/${inviteToken}${pinQuery}`)
    invitation.value = inviteData?.invitation || null
  } catch {
    // Invalid invite token — guest will need to identify manually
  }
}

// Fetch RSVP data, including own votes if email is known
const guestEmail = ref(invitation.value?.inviteeEmail || '')
const rsvpFetchUrl = computed(() => {
  const base = `/api/rsvp/${shareToken}`
  return guestEmail.value ? `${base}?email=${encodeURIComponent(guestEmail.value)}` : base
})
const { data: rsvp, error } = await useFetch(rsvpFetchUrl.value)

// Guest identification
const guestName = ref(invitation.value?.inviteeName || '')
const identified = ref(!!invitation.value)

// RSVP state — pre-fill from invitation if exists
const rsvpStatus = ref(invitation.value?.status === 'accepted' || invitation.value?.status === 'declined' ? invitation.value.status : null)
const rsvpSubmitting = ref(false)
const rsvpDone = ref(!!rsvpStatus.value)

// Voting state — pre-fill from ownVote in poll options
const votes = ref({})
const voteSaving = ref(false)
const votesDone = ref(false)
const editingVotes = ref(false)

// Initialize votes from server data
if (rsvp.value?.poll?.options) {
  for (const opt of rsvp.value.poll.options) {
    if (opt.ownVote) {
      votes.value[opt.id] = {
        status: opt.ownVote.status || opt.ownVote,
        attendFrom: opt.ownVote.attendFrom || null,
        attendUntil: opt.ownVote.attendUntil || null,
      }
    }
  }
  if (Object.keys(votes.value).length > 0) {
    votesDone.value = true
  }
}

function setVote(optionId, status) {
  votes.value[optionId] = {
    ...(votes.value[optionId] || {}),
    status,
  }
}

function setAttendance(optionId, from, until) {
  votes.value[optionId] = {
    ...(votes.value[optionId] || {}),
    attendFrom: from,
    attendUntil: until,
  }
}

async function submitRsvp(status) {
  if (!identified.value && (!guestName.value.trim() || !guestEmail.value.trim())) return
  rsvpSubmitting.value = true
  try {
    if (inviteToken) {
      // Use the invite token endpoint for identified guests
      await $fetch(`/api/invite/${inviteToken}/rsvp`, {
        method: 'POST',
        body: { status },
      })
    } else {
      await $fetch(`/api/rsvp/${shareToken}/rsvp`, {
        method: 'POST',
        body: { status, email: guestEmail.value, name: guestName.value },
      })
    }
    rsvpStatus.value = status
    rsvpDone.value = true
  } catch {
    // silent for now
  } finally {
    rsvpSubmitting.value = false
  }
}

async function submitVotes() {
  if (!identified.value && (!guestName.value.trim() || !guestEmail.value.trim())) return

  const voteArray = Object.entries(votes.value)
    .filter(([, v]) => v.status)
    .map(([optionId, v]) => ({
      optionId,
      status: v.status,
      attendFrom: v.attendFrom || null,
      attendUntil: v.attendUntil || null,
    }))

  if (voteArray.length === 0) return

  voteSaving.value = true
  try {
    if (inviteToken) {
      await $fetch(`/api/invite/${inviteToken}/vote`, {
        method: 'POST',
        body: { votes: voteArray },
      })
    } else {
      await $fetch(`/api/rsvp/${shareToken}/vote`, {
        method: 'POST',
        body: { votes: voteArray },
      })
    }
    votesDone.value = true
    editingVotes.value = false
  } catch {
    // silent
  } finally {
    voteSaving.value = false
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
}

// Total unique voters
const totalVoters = computed(() => {
  const options = rsvp.value?.poll?.options
  if (!options?.length) return 0
  return Math.max(...options.map(o => o.yesCount + o.maybeCount + o.noCount), 0)
})

// Most popular option (highest yes count)
const mostPopularOption = computed(() => {
  const options = rsvp.value?.poll?.options
  if (!options?.length) return null
  const withVotes = options.filter(o => o.yesCount > 0)
  if (!withVotes.length) return null
  return withVotes.reduce((best, o) => o.yesCount > best.yesCount ? o : best, withVotes[0])
})

// Add to calendar (ICS download)
function addToCalendar() {
  const eventDate = rsvp.value?.eventDate
  if (!eventDate) return
  const d = new Date(eventDate)
  const pad = (n) => String(n).padStart(2, '0')
  const dtStart = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
  const endDate = new Date(d.getTime() + 2 * 60 * 60 * 1000) // default 2h duration
  const dtEnd = `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(endDate.getUTCDate())}T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}00Z`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fishionaire Events//RSVP//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${rsvp.value?.title || 'Event'}`,
    `DESCRIPTION:${rsvp.value?.description || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(rsvp.value?.title || 'event').replace(/[^a-zA-Z0-9]/g, '-')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

// Replace mention variables in description
const renderedDescription = computed(() => {
  if (!rsvp.value?.description) return ''
  let desc = rsvp.value.description
  const name = guestName.value || invitation.value?.inviteeName || ''
  const email = guestEmail.value || invitation.value?.inviteeEmail || ''
  const title = rsvp.value?.title || ''
  const date = rsvp.value?.eventDate ? formatDate(rsvp.value.eventDate) : ''
  desc = desc.replace(/\{\{name\}\}/g, name || '{{name}}')
  desc = desc.replace(/\{\{email\}\}/g, email || '{{email}}')
  desc = desc.replace(/\{\{title\}\}/g, title)
  desc = desc.replace(/\{\{date\}\}/g, date)
  return desc
})

// Sign-up/sign-in URLs with return path
const currentPath = computed(() => {
  const base = `/rsvp/${shareToken}`
  return inviteToken ? `${base}?t=${inviteToken}` : base
})
const signUpUrl = computed(() => `/sign-up?return=${encodeURIComponent(currentPath.value)}&name=${encodeURIComponent(guestName.value || '')}`)
const signInUrl = computed(() => `/sign-in?return=${encodeURIComponent(currentPath.value)}`)

// OG meta
useHead(() => ({
  title: rsvp.value?.title ? `${rsvp.value.title} — RSVP` : 'RSVP',
  meta: [
    { property: 'og:title', content: rsvp.value?.title || 'RSVP' },
    { property: 'og:description', content: rsvp.value?.description || '' },
    { property: 'og:type', content: 'website' },
    ...(rsvp.value?.coverImageUrl ? [{ property: 'og:image', content: rsvp.value.coverImageUrl }] : []),
  ],
}))
</script>

<template>
  <div class="rsvp-page">
    <!-- Error state -->
    <div v-if="error" class="rsvp-page__error">
      <Icon name="lucide:alert-circle" size="48" />
      <h2>{{ t('rsvp.guest.notFound') }}</h2>
      <p>{{ t('rsvp.guest.notFoundDesc') }}</p>
    </div>

    <template v-else-if="rsvp">
      <!-- Hero -->
      <div class="rsvp-hero" :class="{ 'rsvp-hero--has-cover': rsvp.coverImageUrl }">
        <div
          v-if="rsvp.coverImageUrl"
          class="rsvp-hero__cover"
          :style="{ backgroundImage: `url(${rsvp.coverImageUrl})` }"
        />
        <div class="rsvp-hero__overlay" />
        <div class="rsvp-hero__content">
          <h1 class="rsvp-hero__title">{{ rsvp.title }}</h1>
          <div v-if="rsvp.description" class="rsvp-hero__description" v-html="renderedDescription" />
        </div>
      </div>

      <!-- Main card -->
      <div class="rsvp-card">
        <!-- Guest identification -->
        <div v-if="!identified" class="rsvp-card__identify">
          <h2 class="rsvp-card__heading">{{ t('rsvp.guest.whoAreYou') }}</h2>
          <div class="rsvp-card__field">
            <input
              v-model="guestName"
              type="text"
              class="rsvp-card__input"
              :placeholder="t('rsvp.guest.namePlaceholder')"
            />
          </div>
          <div class="rsvp-card__field">
            <input
              v-model="guestEmail"
              type="email"
              class="rsvp-card__input"
              :placeholder="t('rsvp.guest.emailPlaceholder')"
            />
          </div>
          <AppButton
            variant="primary"
            size="md"
            :disabled="!guestName.trim() || !guestEmail.trim()"
            @click="identified = true"
          >
            {{ t('rsvp.guest.continue') }}
          </AppButton>
        </div>

        <template v-else>
          <!-- Date Poll -->
          <div v-if="rsvp.poll?.options?.length && rsvp.poll.isActive" class="rsvp-card__section">
            <h2 class="rsvp-card__heading">
              <Icon name="lucide:calendar" size="18" />
              {{ t('rsvp.guest.pickDates') }}
            </h2>

            <!-- Saved state: show summary with progress bars -->
            <div v-if="votesDone && !editingVotes" class="rsvp-poll__summary">
              <div
                v-for="option in rsvp.poll.options"
                :key="'summary-' + option.id"
                :class="['rsvp-poll__result', { 'rsvp-poll__result--winner': rsvp.showPollResults && mostPopularOption?.id === option.id }]"
              >
                <div class="rsvp-poll__result-header">
                  <Icon v-if="rsvp.showPollResults && mostPopularOption?.id === option.id" name="lucide:crown" size="14" class="rsvp-poll__crown" />
                  <span class="rsvp-poll__result-date">{{ formatDate(option.date) }}</span>
                  <span
                    v-if="votes[option.id]?.status"
                    :class="['rsvp-poll__summary-badge', `rsvp-poll__summary-badge--${votes[option.id].status}`]"
                  >
                    <Icon :name="votes[option.id].status === 'yes' ? 'lucide:check' : votes[option.id].status === 'maybe' ? 'lucide:help-circle' : 'lucide:x'" size="12" />
                    {{ votes[option.id].status === 'yes' ? t('rsvp.guest.yes') : votes[option.id].status === 'maybe' ? t('rsvp.guest.maybe') : t('rsvp.guest.no') }}
                  </span>
                </div>

                <!-- Progress bar -->
                <div v-if="rsvp.showPollResults && totalVoters > 0" class="rsvp-poll__bar">
                  <div class="rsvp-poll__bar-track">
                    <div class="rsvp-poll__bar-yes" :style="{ width: `${(option.yesCount / totalVoters) * 100}%` }" />
                    <div class="rsvp-poll__bar-maybe" :style="{ width: `${(option.maybeCount / totalVoters) * 100}%` }" />
                    <div class="rsvp-poll__bar-no" :style="{ width: `${(option.noCount / totalVoters) * 100}%` }" />
                  </div>
                  <div class="rsvp-poll__bar-labels">
                    <span v-if="option.yesCount" class="rsvp-poll__bar-label rsvp-poll__bar-label--yes">
                      <Icon name="lucide:check" size="10" />{{ option.yesCount }}
                    </span>
                    <span v-if="option.maybeCount" class="rsvp-poll__bar-label rsvp-poll__bar-label--maybe">
                      <Icon name="lucide:minus" size="10" />{{ option.maybeCount }}
                    </span>
                    <span v-if="option.noCount" class="rsvp-poll__bar-label rsvp-poll__bar-label--no">
                      <Icon name="lucide:x" size="10" />{{ option.noCount }}
                    </span>
                  </div>
                </div>
              </div>

              <AppButton variant="outline" size="sm" @click="editingVotes = true">
                <Icon name="lucide:pencil" size="14" />
                {{ t('rsvp.guest.editVotes') }}
              </AppButton>
            </div>

            <!-- Voting UI -->
            <div v-else class="rsvp-poll">
              <div
                v-for="option in rsvp.poll.options"
                :key="option.id"
                class="rsvp-poll__option"
              >
                <div class="rsvp-poll__date">
                  <span class="rsvp-poll__date-text">{{ formatDate(option.date) }}</span>
                  <span v-if="option.startTime" class="rsvp-poll__time">
                    {{ formatTime(option.startTime) }}
                    <template v-if="option.endTime"> — {{ formatTime(option.endTime) }}</template>
                  </span>
                </div>

                <div class="rsvp-poll__votes">
                  <button
                    :class="['rsvp-poll__btn', 'rsvp-poll__btn--yes', { 'rsvp-poll__btn--active': votes[option.id]?.status === 'yes' }]"
                    @click="setVote(option.id, 'yes')"
                  >
                    <Icon name="lucide:check" size="16" />
                  </button>
                  <button
                    :class="['rsvp-poll__btn', 'rsvp-poll__btn--maybe', { 'rsvp-poll__btn--active': votes[option.id]?.status === 'maybe' }]"
                    @click="setVote(option.id, 'maybe')"
                  >
                    <Icon name="lucide:help-circle" size="16" />
                  </button>
                  <button
                    :class="['rsvp-poll__btn', 'rsvp-poll__btn--no', { 'rsvp-poll__btn--active': votes[option.id]?.status === 'no' }]"
                    @click="setVote(option.id, 'no')"
                  >
                    <Icon name="lucide:x" size="16" />
                  </button>
                </div>

                <!-- Vote counts (only if organizer enabled it) -->
                <div v-if="rsvp.showPollResults" class="rsvp-poll__counts">
                  <span class="rsvp-poll__count rsvp-poll__count--yes">{{ option.yesCount }}</span>
                  <span class="rsvp-poll__count rsvp-poll__count--maybe">{{ option.maybeCount }}</span>
                  <span class="rsvp-poll__count rsvp-poll__count--no">{{ option.noCount }}</span>
                </div>

                <!-- Partial attendance (shown when yes voted and time range exists) -->
                <div
                  v-if="votes[option.id]?.status === 'yes' && option.startTime && option.endTime"
                  class="rsvp-poll__partial"
                >
                  <span class="rsvp-poll__partial-label">{{ t('rsvp.guest.availableFrom') }}</span>
                  <input
                    type="time"
                    class="rsvp-poll__time-input"
                    :value="votes[option.id]?.attendFrom || formatTime(option.startTime)"
                    @input="setAttendance(option.id, $event.target.value, votes[option.id]?.attendUntil || formatTime(option.endTime))"
                  />
                  <span class="rsvp-poll__partial-label">{{ t('rsvp.guest.until') }}</span>
                  <input
                    type="time"
                    class="rsvp-poll__time-input"
                    :value="votes[option.id]?.attendUntil || formatTime(option.endTime)"
                    @input="setAttendance(option.id, votes[option.id]?.attendFrom || formatTime(option.startTime), $event.target.value)"
                  />
                </div>
              </div>

              <div class="rsvp-poll__legend">
                <span class="rsvp-poll__legend-item"><span class="rsvp-poll__dot rsvp-poll__dot--yes" /> {{ t('rsvp.guest.yes') }}</span>
                <span class="rsvp-poll__legend-item"><span class="rsvp-poll__dot rsvp-poll__dot--maybe" /> {{ t('rsvp.guest.maybe') }}</span>
                <span class="rsvp-poll__legend-item"><span class="rsvp-poll__dot rsvp-poll__dot--no" /> {{ t('rsvp.guest.no') }}</span>
              </div>

              <AppButton
                variant="primary"
                size="md"
                :loading="voteSaving"
                :disabled="Object.keys(votes).length === 0"
                @click="submitVotes"
              >
                {{ t('rsvp.guest.submitVotes') }}
              </AppButton>
            </div>
          </div>

          <!-- RSVP Accept/Decline — only when no active poll (or poll is closed with date set) -->
          <div v-if="rsvp.rsvpEnabled && !rsvp.poll?.isActive" class="rsvp-card__section">
            <h2 class="rsvp-card__heading">
              <Icon name="lucide:calendar-check" size="18" />
              {{ t('rsvp.guest.willYouCome') }}
            </h2>

            <!-- Show the chosen date if poll was closed -->
            <div v-if="rsvp.eventDate" class="rsvp-card__chosen-date">
              <Icon name="lucide:calendar" size="16" />
              <span>{{ formatDate(rsvp.eventDate) }}</span>
              <button class="rsvp-card__add-cal" @click="addToCalendar" :title="t('rsvp.guest.addToCalendar')">
                <Icon name="lucide:calendar-plus" size="14" />
                {{ t('rsvp.guest.addToCalendar') }}
              </button>
            </div>

            <div v-if="rsvpDone" class="rsvp-card__success">
              <Icon name="lucide:check-circle" size="24" />
              <span>{{ rsvpStatus === 'accepted' ? t('rsvp.guest.accepted') : t('rsvp.guest.declined') }}</span>
            </div>

            <div v-else class="rsvp-card__rsvp-buttons">
              <AppButton
                variant="primary"
                size="lg"
                :loading="rsvpSubmitting"
                @click="submitRsvp('accepted')"
              >
                <Icon name="lucide:check" size="18" />
                {{ t('rsvp.guest.accept') }}
              </AppButton>
              <AppButton
                variant="outline"
                size="lg"
                :loading="rsvpSubmitting"
                @click="submitRsvp('declined')"
              >
                <Icon name="lucide:x" size="18" />
                {{ t('rsvp.guest.decline') }}
              </AppButton>
            </div>
          </div>

          <!-- Notification nudge -->
          <div v-if="rsvp.poll?.isActive && !isSignedIn" class="rsvp-card__notify">
            <Icon name="lucide:bell-ring" size="18" class="rsvp-card__notify-icon" />
            <div class="rsvp-card__notify-text">
              <span class="rsvp-card__notify-title">{{ t('rsvp.guest.notifyTitle') }}</span>
              <span class="rsvp-card__notify-desc">{{ t('rsvp.guest.notifyDesc') }}</span>
            </div>
            <NuxtLink :to="signUpUrl" class="rsvp-card__notify-btn">{{ t('rsvp.guest.notifyAction') }}</NuxtLink>
          </div>

          <!-- CTA: create account -->
          <div v-if="!isSignedIn" class="rsvp-card__cta">
            <div class="rsvp-card__cta-content">
              <div class="rsvp-card__cta-icon">
                <Icon name="lucide:sparkles" size="18" />
              </div>
              <div class="rsvp-card__cta-text">
                <span class="rsvp-card__cta-title">{{ t('rsvp.guest.ctaTitle') }}</span>
                <span class="rsvp-card__cta-desc">{{ t('rsvp.guest.createAccountCta') }}</span>
              </div>
            </div>
            <ul class="rsvp-card__cta-benefits">
              <li><Icon name="lucide:bell" size="13" /> {{ t('rsvp.guest.benefit1') }}</li>
              <li><Icon name="lucide:calendar-plus" size="13" /> {{ t('rsvp.guest.benefit2') }}</li>
              <li><Icon name="lucide:vote" size="13" /> {{ t('rsvp.guest.benefit3') }}</li>
            </ul>
            <div class="rsvp-card__cta-actions">
              <NuxtLink :to="signUpUrl" class="rsvp-card__cta-btn rsvp-card__cta-btn--primary">{{ t('rsvp.guest.signUp') }}</NuxtLink>
              <NuxtLink :to="signInUrl" class="rsvp-card__cta-btn rsvp-card__cta-btn--ghost">{{ t('rsvp.guest.login') }}</NuxtLink>
            </div>
          </div>
        </template>
      </div>

      <!-- Branding -->
      <div class="rsvp-page__branding">
        <span>Powered by</span>
        <NuxtLink to="/" class="rsvp-page__brand-link">Fishionaire Events</NuxtLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rsvp-page {
  min-height: 100vh;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rsvp-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 60vh;
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-6);
}

.rsvp-page__error h2 { color: var(--color-text-primary); margin: 0; }
.rsvp-page__error p { margin: 0; }

/* Hero */
.rsvp-hero {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--space-10) var(--space-6);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.rsvp-hero--has-cover { min-height: 280px; }

.rsvp-hero__cover {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.rsvp-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
}

.rsvp-hero__content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
}

.rsvp-hero__title {
  font-family: var(--font-family-heading);
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  color: white;
  margin: 0;
  line-height: 1.2;
}

.rsvp-hero__description {
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--text-base);
  margin: var(--space-3) 0 0;
  line-height: 1.6;
}

/* Main card */
.rsvp-card {
  width: 100%;
  max-width: 640px;
  margin: calc(-1 * var(--space-8)) auto 0;
  position: relative;
  z-index: 2;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.rsvp-card__identify {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.rsvp-card__heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-family-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.rsvp-card__field {
  display: flex;
  flex-direction: column;
}

.rsvp-card__input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  background: var(--color-background);
  color: var(--color-text-primary);
  outline: none;
  transition: all var(--transition-fast);
}

.rsvp-card__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 12%, transparent);
}

.rsvp-card__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-bottom: var(--space-6);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border-light);
}

.rsvp-card__section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.rsvp-card__success {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.rsvp-card__rsvp-buttons {
  display: flex;
  gap: var(--space-3);
}

/* Poll */
.rsvp-poll {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.rsvp-poll__option {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.rsvp-poll__option:hover {
  border-color: var(--color-border);
}

.rsvp-poll__date {
  flex: 1;
  min-width: 160px;
}

.rsvp-poll__date-text {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
}

.rsvp-poll__time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-poll__votes {
  display: flex;
  gap: var(--space-2);
}

.rsvp-poll__btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.rsvp-poll__btn:hover { border-color: var(--color-border); }

.rsvp-poll__btn--yes.rsvp-poll__btn--active {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.rsvp-poll__btn--maybe.rsvp-poll__btn--active {
  background: var(--color-warning);
  border-color: var(--color-warning);
  color: white;
}

.rsvp-poll__btn--no.rsvp-poll__btn--active {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}

.rsvp-poll__counts {
  display: flex;
  gap: var(--space-2);
  font-size: var(--text-xs);
}

.rsvp-poll__count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.rsvp-poll__count--yes { background: color-mix(in srgb, var(--color-success) 12%, transparent); color: var(--color-success); }
.rsvp-poll__count--maybe { background: color-mix(in srgb, var(--color-warning) 12%, transparent); color: var(--color-warning); }
.rsvp-poll__count--no { background: color-mix(in srgb, var(--color-error) 12%, transparent); color: var(--color-error); }

/* Partial attendance */
.rsvp-poll__partial {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-poll__partial-label {
  white-space: nowrap;
}

.rsvp-poll__time-input {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
}

.rsvp-poll__time-input:focus {
  border-color: var(--color-accent);
}

/* Vote summary */
.rsvp-poll__summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.rsvp-poll__summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.rsvp-poll__summary-date {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.rsvp-poll__summary-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.rsvp-poll__summary-badge--yes {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}

.rsvp-poll__summary-badge--maybe {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.rsvp-poll__summary-badge--no {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}

.rsvp-poll__summary-badge--none {
  color: var(--color-text-muted);
}

/* Result rows with progress bars */
.rsvp-poll__result {
  padding: var(--space-3) var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: border-color var(--transition-fast);
}

.rsvp-poll__result--winner {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 3%, transparent);
}

.rsvp-poll__result-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.rsvp-poll__crown {
  color: var(--color-accent);
  flex-shrink: 0;
}

.rsvp-poll__result-date {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  flex: 1;
}

/* Progress bar */
.rsvp-poll__bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rsvp-poll__bar-track {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
}

.rsvp-poll__bar-yes {
  background: var(--color-success);
  transition: width 0.4s ease;
}

.rsvp-poll__bar-maybe {
  background: var(--color-warning);
  transition: width 0.4s ease;
}

.rsvp-poll__bar-no {
  background: color-mix(in srgb, var(--color-text-primary) 15%, transparent);
  transition: width 0.4s ease;
}

.rsvp-poll__bar-labels {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.rsvp-poll__bar-label {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: var(--font-weight-medium);
}

.rsvp-poll__bar-label--yes { color: var(--color-success); }
.rsvp-poll__bar-label--maybe { color: var(--color-warning); }
.rsvp-poll__bar-label--no { color: var(--color-text-muted); }

/* Notification nudge */
.rsvp-card__notify {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-warning) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 15%, transparent);
  border-radius: var(--radius-lg);
  margin-top: var(--space-2);
}

.rsvp-card__notify-icon {
  color: var(--color-warning);
  flex-shrink: 0;
}

.rsvp-card__notify-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.rsvp-card__notify-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.rsvp-card__notify-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-card__notify-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}

.rsvp-card__notify-btn:hover {
  opacity: 0.9;
}

/* Chosen date + calendar */
.rsvp-card__chosen-date {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 12%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.rsvp-card__add-cal {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-accent);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.rsvp-card__add-cal:hover {
  background: var(--color-accent);
  color: white;
}

.rsvp-poll__legend {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-poll__legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.rsvp-poll__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.rsvp-poll__dot--yes { background: var(--color-success); }
.rsvp-poll__dot--maybe { background: var(--color-warning); }
.rsvp-poll__dot--no { background: var(--color-error); }

/* Account CTA */
.rsvp-card__cta {
  margin-top: var(--space-6);
  padding: var(--space-5);
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 6%, transparent), color-mix(in srgb, var(--color-accent) 2%, transparent));
  border: 1px solid color-mix(in srgb, var(--color-accent) 12%, transparent);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.rsvp-card__cta-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.rsvp-card__cta-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  flex-shrink: 0;
}

.rsvp-card__cta-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rsvp-card__cta-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.rsvp-card__cta-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.rsvp-card__cta-benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.rsvp-card__cta-benefits li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.rsvp-card__cta-benefits li .iconify {
  color: var(--color-accent);
  flex-shrink: 0;
}

.rsvp-card__cta-actions {
  display: flex;
  gap: var(--space-2);
}

.rsvp-card__cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.rsvp-card__cta-btn--primary {
  background: var(--color-accent);
  color: white;
}

.rsvp-card__cta-btn--primary:hover {
  opacity: 0.9;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-accent) 30%, transparent);
}

.rsvp-card__cta-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
}

.rsvp-card__cta-btn--ghost:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

/* Branding */
.rsvp-page__branding {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-page__brand-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.rsvp-page__brand-link:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .rsvp-card {
    margin-top: calc(-1 * var(--space-4));
    margin-left: var(--space-3);
    margin-right: var(--space-3);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
  }

  .rsvp-poll__option {
    flex-direction: column;
    align-items: flex-start;
  }

  .rsvp-poll__votes {
    width: 100%;
    justify-content: flex-start;
  }

  .rsvp-card__rsvp-buttons {
    flex-direction: column;
  }
}
</style>
