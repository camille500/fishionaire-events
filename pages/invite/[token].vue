<script setup>
definePageMeta({ layout: false })

const { t, locale } = useI18n()
const route = useRoute()
const token = String(route.params.token)
const toast = useToast()

const { data, error } = await useFetch(`/api/invite/${token}`)

const eventData = computed(() => data.value?.event || null)
const invitation = computed(() => data.value?.invitation || null)
const subEvents = computed(() => data.value?.subEvents || [])
const subEventRsvps = ref(data.value?.subEventRsvps || {})

// OG Meta tags for social sharing
const ogTitle = computed(() => eventData.value?.title || 'Event Invitation')
const ogDescription = computed(() => {
  const parts = []
  if (formattedDate.value) parts.push(formattedDate.value)
  if (eventData.value?.location) parts.push(eventData.value.location)
  if (eventData.value?.description) parts.push(eventData.value.description.slice(0, 120))
  return parts.join(' \u2022 ') || t('invite.welcome')
})

useSeoMeta({
  title: ogTitle,
  ogTitle: ogTitle,
  ogDescription: ogDescription,
  ogImage: () => eventData.value?.coverImageUrl || undefined,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: ogTitle,
  twitterDescription: ogDescription,
  twitterImage: () => eventData.value?.coverImageUrl || undefined,
})

useHead({
  title: ogTitle,
})

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

const hasPoll = computed(() => !!eventData.value?.hasActivePoll)
const hasWishlist = computed(() => eventData.value?.features?.wishlist)
const isPlusOne = computed(() => !!invitation.value?.invitedById)
const invitedByName = computed(() => invitation.value?.invitedByName || '')
const showPlusOnes = computed(() => !isPlusOne.value && invitation.value?.plusOnes > 0)
const remainingPlusOnes = computed(() => {
  const inv = invitation.value
  if (!inv) return 0
  const filled = inv.plusOneInvites?.length || 0
  return Math.max(0, (inv.plusOnes || 0) - filled)
})
const plusOneInvites = computed(() => invitation.value?.plusOneInvites || [])

// Plus-one management
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

async function addPlusOne(name, email) {
  plusOneSaving.value = true
  try {
    const result = await $fetch(`/api/invite/${token}/plus-one`, {
      method: 'POST',
      body: { name, email },
    })
    const refreshed = await $fetch(`/api/invite/${token}`)
    data.value = refreshed
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
    toast.add({ title: t('toast.plusOneRemoved'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}

// RSVP
async function rsvp(status) {
  rsvpLoading.value = true
  try {
    const result = await $fetch(`/api/invite/${token}/rsvp`, {
      method: 'POST',
      body: { status },
    })
    rsvpStatus.value = result.status
    toast.add({ title: t('toast.rsvpSuccess'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.rsvpError'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    rsvpLoading.value = false
  }
}

function handleChangeResponse() {
  rsvpStatus.value = 'pending'
}

async function handleSubEventRsvp(subEventId, status) {
  try {
    await $fetch(`/api/invite/${token}/sub-event-rsvp`, {
      method: 'POST',
      body: { subEventId, status },
    })
    subEventRsvps.value = { ...subEventRsvps.value, [subEventId]: status }
  } catch {
    toast.add({ title: t('toast.rsvpError'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}

watch(invitation, (inv) => {
  if (inv) rsvpStatus.value = inv.status
}, { immediate: true })

// Dietary preferences
const dietarySaving = ref({})

async function submitDietary(subEventId, dietaryData) {
  dietarySaving.value[subEventId] = true
  try {
    await $fetch(`/api/invite/${token}/dietary`, {
      method: 'POST',
      body: {
        subEventId,
        ...dietaryData,
      },
    })
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    dietarySaving.value[subEventId] = false
  }
}

// Music requests
const musicLists = reactive({})

watch(subEvents, (subs) => {
  for (const se of subs) {
    if (se.type === 'party' && !musicLists[se.id]) {
      fetchMusicRequests(se.id)
    }
  }
}, { immediate: true })

async function fetchMusicRequests(subEventId) {
  try {
    musicLists[subEventId] = await $fetch(`/api/invite/${token}/music-requests`, { query: { subEventId } })
  } catch {
    musicLists[subEventId] = []
  }
}

async function submitMusicRequest(subEventId, track) {
  if (!track?.songTitle?.trim()) return
  try {
    await $fetch(`/api/invite/${token}/music-request`, {
      method: 'POST',
      body: {
        subEventId,
        songTitle: track.songTitle,
        artist: track.artist || null,
        spotifyTrackId: track.spotifyTrackId || null,
        spotifyUri: track.spotifyUri || null,
        albumArtUrl: track.albumArtUrl || null,
        previewUrl: track.previewUrl || null,
        durationMs: track.durationMs || null,
      },
    })
    await fetchMusicRequests(subEventId)
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}

async function upvoteMusic(subEventId, requestId) {
  try {
    await $fetch(`/api/invite/${token}/music-request/${requestId}/upvote`, {
      method: 'POST',
    })
    await fetchMusicRequests(subEventId)
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}
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
      <!-- 1. Full-viewport hero -->
      <InviteHero
        :event-data="eventData"
        :accent-color="accentColor"
        :formatted-date="formattedDate"
        :formatted-time="formattedTime"
        :has-poll="hasPoll"
      />

      <!-- 2. Welcome + RSVP (overlaps hero) -->
      <InviteWelcomeRsvp
        :event-data="eventData"
        :invitation="invitation"
        :is-plus-one="isPlusOne"
        :invited-by-name="invitedByName"
        :rsvp-status="rsvpStatus"
        :rsvp-loading="rsvpLoading"
        :sub-events="subEvents"
        :sub-event-rsvps="subEventRsvps"
        @rsvp="rsvp"
        @change-response="handleChangeResponse"
        @sub-event-rsvp="handleSubEventRsvp"
      />

      <!-- 3. Content sections -->
      <main class="invite-body">
        <!-- Plus-ones -->
        <section
          v-if="showPlusOnes"
          class="invite-section invite-section--tinted invite-section--reveal"
          style="animation-delay: 100ms"
        >
          <div class="invite-section__inner">
            <InvitePlusOnes
              :plus-one-invites="plusOneInvites"
              :remaining-plus-ones="remainingPlusOnes"
              :copied-plus-one-id="copiedPlusOneId"
              :plus-one-saving="plusOneSaving"
              :invitation="invitation"
              @add="addPlusOne"
              @remove="removePlusOne"
              @copy-link="copyPlusOneLink"
            />
          </div>
        </section>

        <!-- Date poll -->
        <section
          v-if="hasPoll"
          class="invite-section invite-section--tinted invite-section--reveal"
          style="animation-delay: 150ms"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:bar-chart-3" size="22" />
              {{ t('invite.poll.title') }}
            </h2>
            <p class="invite-section__subtitle">{{ t('invite.poll.subtitle') }}</p>
            <DatePollVotingForm
              :event-id="parseInt(eventData.id)"
              :initial-email="invitation?.inviteeEmail || ''"
              :initial-name="invitation?.inviteeName || ''"
              :token="token"
              :event-title="eventData.title"
            />
          </div>
        </section>

        <!-- Location map -->
        <section
          v-if="eventData.locationLat && eventData.locationLon"
          class="invite-section invite-section--reveal"
          style="animation-delay: 200ms"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:map-pin" size="22" />
              {{ t('invite.location.title') }}
            </h2>
            <StaticLocationMap
              :lat="eventData.locationLat"
              :lon="eventData.locationLon"
              :label="eventData.location"
            />
          </div>
        </section>

        <!-- Programme timeline -->
        <section
          v-if="subEvents.length > 0"
          class="invite-section invite-section--reveal"
          style="animation-delay: 250ms"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:calendar-range" size="22" />
              {{ t('invite.programme.title') }}
            </h2>
            <InviteProgrammeTimeline
              :sub-events="subEvents"
              :invitation="invitation"
              :event-data="eventData"
              :token="token"
              :music-lists="musicLists"
              :dietary-saving="dietarySaving"
              @submit-dietary="submitDietary"
              @submit-music="submitMusicRequest"
              @upvote-music="upvoteMusic"
            />
          </div>
        </section>

        <!-- Wishlist -->
        <section
          v-if="hasWishlist"
          class="invite-section invite-section--tinted invite-section--reveal"
          style="animation-delay: 300ms"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:gift" size="22" />
              {{ t('invite.wishlist.title') }}
            </h2>
            <p class="invite-section__subtitle">{{ t('invite.wishlist.subtitle') }}</p>
            <WishlistGuestView :token="token" />
          </div>
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

/* ── Body ────────────────────────────── */
.invite-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── Sections ────────────────────────── */
.invite-section {
  padding: var(--space-16) var(--space-6);
}

.invite-section:first-child {
  padding-top: var(--space-12);
}

.invite-section--reveal {
  animation: sectionReveal 600ms ease-out both;
}

@keyframes sectionReveal {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.invite-section--tinted {
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 3%, var(--color-bg, var(--color-background)));
}

.invite-section__inner {
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.invite-section__title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-family-heading);
  font-size: clamp(var(--text-xl), 3vw, var(--text-2xl));
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
  line-height: var(--line-height-tight);
  margin: 0 0 var(--space-2) 0;
}

.invite-section__title :deep(.iconify) {
  color: var(--event-accent, var(--color-accent));
}

.invite-section__subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--space-6) 0;
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
  padding: var(--space-8) var(--space-6);
  text-align: center;
}

.invite-page__footer-link {
  color: var(--event-accent, var(--color-accent));
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.invite-page__footer-link:hover {
  text-decoration: underline;
}

/* ── Responsive ──────────────────────── */
@media (max-width: 640px) {
  .invite-section {
    padding: var(--space-10) var(--space-4);
  }

  .invite-section:first-child {
    padding-top: var(--space-8);
  }

}
</style>
