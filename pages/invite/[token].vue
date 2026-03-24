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
const pollVoted = ref(false)

// Sticky RSVP bar visibility (mobile)
const rsvpSectionRef = ref(null)
const rsvpSectionVisible = ref(true)

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  const observer = new IntersectionObserver(
    ([entry]) => { rsvpSectionVisible.value = entry.isIntersecting },
    { threshold: 0.1 },
  )
  watch(rsvpSectionRef, (el) => {
    if (el?.$el) observer.observe(el.$el)
    else if (el) observer.observe(el)
  }, { immediate: true })
  onUnmounted(() => observer.disconnect())
})

const eventTypeColorMap = {
  birthday: '#9b59b6',
  wedding: '#e91e63',
  dinner: '#ff9800',
  baby_shower: '#4caf50',
  corporate: '#2196f3',
  other: '#6c7a89',
}

const accentColor = computed(() => {
  if (eventData.value?.themeColor) return eventData.value.themeColor
  return eventTypeColorMap[eventData.value?.eventType] || 'var(--color-accent)'
})

const customThemeStyles = computed(() => {
  if (!eventData.value?.themeColor) return {}
  return deriveAccentVariants(eventData.value.themeColor)
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
const hasGallery = computed(() => eventData.value?.features?.photoGallery)
const hasSocialWall = computed(() => eventData.value?.features?.socialWall)
const hasCheckIn = computed(() => eventData.value?.features?.checkIn)

// QR Code generation for accepted guests
const qrCodeDataUrl = ref(null)

watch(rsvpStatus, async (status) => {
  if (status === 'accepted' && hasCheckIn.value && typeof window !== 'undefined') {
    const QRCode = await import('qrcode')
    const inviteUrl = `${window.location.origin}/invite/${token}`
    qrCodeDataUrl.value = await QRCode.toDataURL(inviteUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#1a1a2e' },
    })
  }
}, { immediate: true })
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

// Section navigation
const navSections = computed(() => {
  const sections = []
  if (showPlusOnes.value) sections.push({ id: 'section-plus-ones', label: t('invite.nav.plusOnes'), icon: 'lucide:user-plus' })
  if (eventData.value?.locationLat && eventData.value?.locationLon) sections.push({ id: 'section-location', label: t('invite.nav.location'), icon: 'lucide:map-pin' })
  if (subEvents.value.length > 0) sections.push({ id: 'section-programme', label: t('invite.nav.programme'), icon: 'lucide:calendar-range' })
  if (hasWishlist.value) sections.push({ id: 'section-wishlist', label: t('invite.nav.wishlist'), icon: 'lucide:gift' })
  if (hasGallery.value) sections.push({ id: 'section-gallery', label: t('invite.nav.gallery'), icon: 'lucide:camera' })
  if (hasSocialWall.value) sections.push({ id: 'section-social-wall', label: t('invite.nav.socialWall'), icon: 'lucide:message-circle-heart' })
  return sections
})

// Guest progress tracking
const progressSteps = computed(() => {
  const steps = []
  // RSVP
  steps.push({
    id: 'rsvp',
    label: t('invite.progress.rsvp'),
    icon: 'lucide:check-circle',
    completed: rsvpStatus.value !== 'pending',
  })
  // Date poll
  if (hasPoll.value) {
    steps.push({
      id: 'datePoll',
      label: t('invite.rsvp.stepDates'),
      icon: 'lucide:bar-chart-3',
      completed: pollVoted.value,
    })
  }
  // Dietary (if any dinner sub-events exist)
  const hasDinner = subEvents.value.some(se => se.type === 'dinner')
  if (hasDinner) {
    steps.push({
      id: 'dietary',
      label: t('invite.progress.dietary'),
      icon: 'lucide:heart-pulse',
      completed: dietaryCompleted.value,
    })
  }
  // Music (if any party sub-events exist)
  const hasParty = subEvents.value.some(se => se.type === 'party')
  if (hasParty) {
    steps.push({
      id: 'music',
      label: t('invite.progress.music'),
      icon: 'lucide:music',
      completed: musicCompleted.value,
    })
  }
  return steps
})

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

function scrollToRsvpCard() {
  const el = rsvpSectionRef.value?.$el || rsvpSectionRef.value
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function handleSubEventRsvp(subEventId, status) {
  try {
    await $fetch(`/api/invite/${token}/sub-event-rsvp`, {
      method: 'POST',
      body: { subEventId, status },
    })
    subEventRsvps.value = { ...subEventRsvps.value, [subEventId]: status }
    toast.add({ title: t('toast.subEventRsvpSuccess'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.rsvpError'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}

watch(invitation, (inv) => {
  if (inv) rsvpStatus.value = inv.status
}, { immediate: true })

// Dietary preferences
const dietarySaving = ref({})
const dietaryCompleted = ref(false)

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
    dietaryCompleted.value = true
    toast.add({ title: t('toast.dietarySaved'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    dietarySaving.value[subEventId] = false
  }
}

// Music requests
const musicLists = reactive({})
const musicCompleted = ref(false)

watch(subEvents, (subs) => {
  for (const se of subs) {
    if (se.type === 'party' && !musicLists[se.id]) {
      fetchMusicRequests(se.id)
    }
  }
}, { immediate: true })

// Initialize music progress dot from existing requests
watch(() => ({ ...musicLists }), (lists) => {
  if (musicCompleted.value) return
  const guestEmail = invitation.value?.inviteeEmail
  if (!guestEmail) return
  for (const seId in lists) {
    if (lists[seId]?.some(r => r.guestEmail === guestEmail)) {
      musicCompleted.value = true
      return
    }
  }
}, { deep: true })

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
    musicCompleted.value = true
    toast.add({ title: t('toast.musicRequested'), icon: 'i-lucide-check', color: 'green' })
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
    toast.add({ title: t('toast.musicUpvoted'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}
</script>

<template>
  <div class="invite-page" :style="{ '--event-accent': accentColor, ...customThemeStyles }">
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

      <!-- 2. Welcome + RSVP + Date Poll (overlaps hero) -->
      <InviteWelcomeRsvp
        ref="rsvpSectionRef"
        :event-data="eventData"
        :invitation="invitation"
        :is-plus-one="isPlusOne"
        :invited-by-name="invitedByName"
        :rsvp-status="rsvpStatus"
        :rsvp-loading="rsvpLoading"
        :sub-events="subEvents"
        :sub-event-rsvps="subEventRsvps"
        :has-poll="hasPoll"
        :event-id="parseInt(eventData.id)"
        :token="token"
        :initial-email="invitation?.inviteeEmail || ''"
        :initial-name="invitation?.inviteeName || ''"
        @rsvp="rsvp"
        @change-response="handleChangeResponse"
        @sub-event-rsvp="handleSubEventRsvp"
        @poll-voted="pollVoted = true"
      />

      <!-- 3. Section navigation + progress -->
      <div class="invite-nav-bar">
        <InviteSectionNav :sections="navSections" />
        <InviteProgressDots :steps="progressSteps" />
      </div>

      <!-- 4. Content sections -->
      <main class="invite-body">
        <!-- Plus-ones -->
        <section
          v-if="showPlusOnes"
          id="section-plus-ones"
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

        <!-- Location map -->
        <section
          v-if="eventData.locationLat && eventData.locationLon"
          id="section-location"
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
          id="section-programme"
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
          id="section-wishlist"
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

        <!-- Gallery -->
        <section
          v-if="hasGallery"
          id="section-gallery"
          class="invite-section invite-section--reveal"
          style="animation-delay: 350ms"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:camera" size="22" />
              {{ t('invite.gallery.title') }}
            </h2>
            <p class="invite-section__subtitle">{{ t('invite.gallery.subtitle') }}</p>
            <InviteGallerySection :token="token" :event-data="eventData" />
          </div>
        </section>

        <!-- Social Wall -->
        <section
          v-if="hasSocialWall"
          id="section-social-wall"
          class="invite-section invite-section--reveal"
          style="animation-delay: 400ms"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:message-circle-heart" size="22" />
              {{ t('invite.socialWall.title') }}
            </h2>
            <p class="invite-section__subtitle">{{ t('invite.socialWall.subtitle') }}</p>
            <InviteSocialWallSection :token="token" :event-data="eventData" />
          </div>
        </section>

        <!-- QR Code check-in -->
        <section
          v-if="hasCheckIn && rsvpStatus === 'accepted' && qrCodeDataUrl"
          class="invite-section invite-section--reveal"
          style="animation-delay: 500ms"
        >
          <div class="invite-section__inner invite-qr-code">
            <h2 class="invite-section__title">
              <Icon name="lucide:scan-line" size="22" />
              {{ t('invite.qrCode.title') }}
            </h2>
            <p class="invite-section__subtitle">{{ t('invite.qrCode.description') }}</p>
            <div class="invite-qr-code__image-wrapper">
              <img
                :src="qrCodeDataUrl"
                :alt="t('invite.qrCode.alt')"
                class="invite-qr-code__image"
              />
            </div>
          </div>
        </section>
      </main>

      <!-- Sticky RSVP bar (mobile) -->
      <StickyRsvpBar
        :rsvp-status="rsvpStatus"
        :rsvp-loading="rsvpLoading"
        :rsvp-closed="!eventData.rsvpEnabled"
        :visible="!rsvpSectionVisible"
        :has-poll="hasPoll"
        :poll-voted="pollVoted"
        @rsvp="rsvp"
        @change-response="handleChangeResponse"
        @scroll-to-poll="scrollToRsvpCard"
      />

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

/* ── Nav bar ─────────────────────────── */
.invite-nav-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--color-bg, var(--color-background)) 90%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-3) var(--space-4);
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

/* ── QR Code check-in ─────────────── */
.invite-qr-code {
  text-align: center;
}

.invite-qr-code__image-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--space-4);
}

.invite-qr-code__image {
  width: 200px;
  height: 200px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}
</style>
