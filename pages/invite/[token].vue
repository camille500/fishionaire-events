<script setup>
definePageMeta({ layout: false })

const { t, locale } = useI18n()
const route = useRoute()
const token = String(route.params.token)
const toast = useToast()

const { data, error } = await useFetch(`/api/invite/${token}`)

// Redirect RSVP-mode events to the dedicated /rsvp page
if (data.value?.event?.mode === 'rsvp' && data.value?.event?.shareToken) {
  await navigateTo(`/rsvp/${data.value.event.shareToken}?t=${token}`, { replace: true })
}

// PIN gate state
const requiresPin = ref(!!data.value?.requiresPin)
const pinInput = ref('')
const pinError = ref('')
const pinVerifying = ref(false)
const pinVerified = ref(!requiresPin.value)

async function verifyPin() {
  if (pinInput.value.length !== 6) return
  pinVerifying.value = true
  pinError.value = ''
  try {
    await $fetch(`/api/invite/${token}/verify-pin`, {
      method: 'POST',
      body: { pin: pinInput.value },
    })
    // PIN correct — refetch full data with pin
    const fullData = await $fetch(`/api/invite/${token}?pin=${pinInput.value}`)
    data.value = fullData

    // Re-check RSVP mode redirect after PIN verification
    if (fullData?.event?.mode === 'rsvp' && fullData?.event?.shareToken) {
      window.location.replace(`/rsvp/${fullData.event.shareToken}?t=${token}&pin=${pinInput.value}`)
      return
    }

    pinVerified.value = true
    requiresPin.value = false
  } catch {
    pinError.value = t('invite.pin.incorrect')
    pinInput.value = ''
  } finally {
    pinVerifying.value = false
  }
}

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

// IntersectionObserver for section reveal animations
const revealedSections = reactive(new Set())

function useRevealObserver() {
  if (typeof IntersectionObserver === 'undefined') return
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-reveal')
          if (id) revealedSections.add(id)
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px 50px 0px' },
  )
  return observer
}

let revealObserver = null
let rsvpObserver = null
let stopRsvpWatch = null

onMounted(() => {
  // RSVP section visibility observer
  if (typeof IntersectionObserver === 'undefined') return
  rsvpObserver = new IntersectionObserver(
    ([entry]) => { rsvpSectionVisible.value = entry.isIntersecting },
    { threshold: 0.1 },
  )
  stopRsvpWatch = watch(rsvpSectionRef, (el) => {
    if (el?.$el) rsvpObserver.observe(el.$el)
    else if (el) rsvpObserver.observe(el)
  }, { immediate: true })

  // Section reveal observer
  revealObserver = useRevealObserver()
  if (revealObserver) {
    nextTick(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        revealObserver.observe(el)
      })
    })
  }
})

onUnmounted(() => {
  stopRsvpWatch?.()
  rsvpObserver?.disconnect()
  revealObserver?.disconnect()
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
  return deriveAccentVariants(eventData.value.themeColor, {
    secondaryHex: eventData.value.themeColorSecondary || null,
    gradientAngle: eventData.value.gradientAngle ?? 135,
  })
})

// Font loading
const fontPairingId = computed(() => eventData.value?.fontPairing || null)
const { fontVars } = useFontLoader(fontPairingId)

// Combined theme styles
const allThemeStyles = computed(() => ({
  '--event-accent': accentColor.value,
  ...customThemeStyles.value,
  ...fontVars.value,
}))

// Welcome message with guest name interpolation
const welcomeMessageRendered = computed(() => {
  const msg = eventData.value?.welcomeMessage
  if (!msg) return null
  const name = invitation.value?.inviteeName || invitation.value?.inviteeEmail || ''
  return msg.replace(/\{\{name\}\}/g, name)
})

// Color mode override
const colorModeOverride = computed(() => eventData.value?.colorMode || 'auto')

// Background pattern class
const backgroundPatternClass = computed(() => {
  const pattern = eventData.value?.backgroundPattern
  if (!pattern) return ''
  return `invite-body--pattern-${pattern}`
})

// Card style class
const cardStyleClass = computed(() => {
  const style = eventData.value?.cardStyle
  if (!style || style === 'glass') return ''
  return `invite-page--card-${style}`
})

// Hero animation
const heroAnimation = computed(() => eventData.value?.heroAnimation || 'fadeUp')

// Branding
const showBranding = computed(() => !eventData.value?.hideBranding)

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
    try {
      const QRCode = await import('qrcode')
      const inviteUrl = `${window.location.origin}/invite/${token}`
      qrCodeDataUrl.value = await QRCode.toDataURL(inviteUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#1a1a2e' },
      })
    } catch {
      // QR code generation failed — section simply won't render
    }
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
  // Dietary (if any sub-events have dietary enabled)
  const hasDietary = subEvents.value.some(se => se.typeConfig?.dietaryEnabled)
  if (hasDietary) {
    steps.push({
      id: 'dietary',
      label: t('invite.progress.dietary'),
      icon: 'lucide:heart-pulse',
      completed: dietaryCompleted.value,
    })
  }
  // Music (if any sub-events have music requests enabled)
  const hasMusic = subEvents.value.some(se => se.typeConfig?.musicRequestsEnabled)
  if (hasMusic) {
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

const removingPlusOne = ref(null)

async function removePlusOne(plusOneId) {
  removingPlusOne.value = plusOneId
  try {
    await $fetch(`/api/invite/${token}/plus-one/${plusOneId}`, { method: 'DELETE' })
    const refreshed = await $fetch(`/api/invite/${token}`)
    data.value = refreshed
    toast.add({ title: t('toast.plusOneRemoved'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    removingPlusOne.value = null
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

const subEventRsvpLoading = ref({})

async function handleSubEventRsvp(subEventId, status) {
  subEventRsvpLoading.value[subEventId] = true
  try {
    await $fetch(`/api/invite/${token}/sub-event-rsvp`, {
      method: 'POST',
      body: { subEventId, status },
    })
    subEventRsvps.value = { ...subEventRsvps.value, [subEventId]: status }
    toast.add({ title: t('toast.subEventRsvpSuccess'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.rsvpError'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    subEventRsvpLoading.value[subEventId] = false
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
    if (se.typeConfig?.musicRequestsEnabled && !musicLists[se.id]) {
      fetchMusicRequests(se.id)
    }
  }
}, { immediate: true })

async function fetchMusicRequests(subEventId) {
  try {
    musicLists[subEventId] = await $fetch(`/api/invite/${token}/music-requests`, { query: { subEventId } })
    if (!musicCompleted.value) {
      const guestEmail = invitation.value?.inviteeEmail
      if (guestEmail && musicLists[subEventId]?.some(r => r.guestEmail === guestEmail)) {
        musicCompleted.value = true
      }
    }
  } catch {
    musicLists[subEventId] = []
  }
}

const musicSubmitting = ref({})

async function submitMusicRequest(subEventId, track) {
  if (!track?.songTitle?.trim()) return
  musicSubmitting.value[subEventId] = true
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
  } finally {
    musicSubmitting.value[subEventId] = false
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
  <div
    class="invite-page"
    :class="[
      cardStyleClass,
      colorModeOverride === 'dark' ? 'dark' : '',
      colorModeOverride === 'light' ? 'light-forced' : '',
    ]"
    :style="allThemeStyles"
  >
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

    <!-- PIN gate -->
    <div v-else-if="requiresPin && !pinVerified" class="invite-pin-gate">
      <div class="invite-pin-gate__card">
        <div v-if="eventData?.coverImageUrl" class="invite-pin-gate__cover">
          <img :src="eventData.coverImageUrl" :alt="eventData?.title || ''" />
        </div>
        <div class="invite-pin-gate__body">
          <div v-if="invitation?.inviteeName" class="invite-pin-gate__greeting">
            {{ t('invite.welcomeNamed', { name: invitation.inviteeName }) }}
          </div>
          <h1 v-else class="invite-pin-gate__greeting">{{ t('invite.welcome') }}</h1>
          <h2 v-if="eventData?.title" class="invite-pin-gate__event-title">{{ eventData.title }}</h2>

          <div class="invite-pin-gate__form">
            <label class="invite-pin-gate__label">{{ t('invite.pin.title') }}</label>
            <p class="invite-pin-gate__hint">{{ t('invite.pin.subtitle') }}</p>
            <input
              v-model="pinInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              :placeholder="t('invite.pin.placeholder')"
              class="invite-pin-gate__input"
              autofocus
              @keyup.enter="verifyPin"
            />
            <p v-if="pinError" class="invite-pin-gate__error">{{ pinError }}</p>
            <AppButton
              :disabled="pinInput.length !== 6 || pinVerifying"
              :loading="pinVerifying"
              class="invite-pin-gate__submit"
              @click="verifyPin"
            >
              {{ t('invite.pin.verify') }}
            </AppButton>
          </div>
        </div>
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
        :hero-animation="heroAnimation"
        :show-branding="showBranding"
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
        :accent-color="accentColor"
        :welcome-message="welcomeMessageRendered"
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
      <main class="invite-body" :class="backgroundPatternClass">
        <!-- Plus-ones -->
        <section
          v-if="showPlusOnes"
          id="section-plus-ones"
          data-reveal="plus-ones"
          class="invite-section invite-section--tinted"
          :class="{ 'invite-section--revealed': revealedSections.has('plus-ones') }"
        >
          <div class="invite-section__inner">
            <InvitePlusOnes
              :plus-one-invites="plusOneInvites"
              :remaining-plus-ones="remainingPlusOnes"
              :copied-plus-one-id="copiedPlusOneId"
              :plus-one-saving="plusOneSaving"
              :removing-plus-one="removingPlusOne"
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
          data-reveal="location"
          class="invite-section"
          :class="{ 'invite-section--revealed': revealedSections.has('location') }"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:map-pin" size="22" />
              {{ t('invite.location.title') }}
            </h2>
            <LazyStaticLocationMap
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
          data-reveal="programme"
          class="invite-section"
          :class="{ 'invite-section--revealed': revealedSections.has('programme') }"
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
              :music-submitting="musicSubmitting"
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
          data-reveal="wishlist"
          class="invite-section invite-section--tinted"
          :class="{ 'invite-section--revealed': revealedSections.has('wishlist') }"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:gift" size="22" />
              {{ t('invite.wishlist.title') }}
            </h2>
            <p class="invite-section__subtitle">{{ t('invite.wishlist.subtitle') }}</p>
            <LazyWishlistGuestView :token="token" />
          </div>
        </section>

        <!-- Gallery -->
        <section
          v-if="hasGallery"
          id="section-gallery"
          data-reveal="gallery"
          class="invite-section"
          :class="{ 'invite-section--revealed': revealedSections.has('gallery') }"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:camera" size="22" />
              {{ t('invite.gallery.title') }}
            </h2>
            <p class="invite-section__subtitle">{{ t('invite.gallery.subtitle') }}</p>
            <LazyInviteGallerySection :token="token" :event-data="eventData" />
          </div>
        </section>

        <!-- Social Wall -->
        <section
          v-if="hasSocialWall"
          id="section-social-wall"
          data-reveal="social-wall"
          class="invite-section"
          :class="{ 'invite-section--revealed': revealedSections.has('social-wall') }"
        >
          <div class="invite-section__inner">
            <h2 class="invite-section__title">
              <Icon name="lucide:message-circle-heart" size="22" />
              {{ t('invite.socialWall.title') }}
            </h2>
            <p class="invite-section__subtitle">{{ t('invite.socialWall.subtitle') }}</p>
            <LazyInviteSocialWallSection :token="token" :event-data="eventData" />
          </div>
        </section>

        <!-- QR Code check-in -->
        <section
          v-if="hasCheckIn && rsvpStatus === 'accepted' && qrCodeDataUrl"
          data-reveal="qr-code"
          class="invite-section"
          :class="{ 'invite-section--revealed': revealedSections.has('qr-code') }"
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
      <footer v-if="showBranding" class="invite-page__footer">
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

.invite-section[data-reveal] {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}

.invite-section--revealed {
  opacity: 1;
  transform: translateY(0);
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

/* ── Card style variants ────────────── */
.invite-page--card-solid :deep(.invite-rsvp__card),
.invite-page--card-solid :deep(.invite-section--tinted) {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.08));
}

.invite-page--card-outlined :deep(.invite-rsvp__card),
.invite-page--card-outlined :deep(.invite-section--tinted) {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: transparent;
  border: 2px solid var(--event-accent, var(--color-accent));
  box-shadow: none;
}

/* ── Background patterns ────────────── */
.invite-body--pattern-dots {
  background-image: radial-gradient(var(--event-accent, var(--color-accent)) 1px, transparent 1px);
  background-size: 24px 24px;
  background-blend-mode: overlay;
}

.invite-body--pattern-crosshatch {
  background-image:
    linear-gradient(45deg, var(--event-accent, var(--color-accent)) 0.5px, transparent 0.5px),
    linear-gradient(-45deg, var(--event-accent, var(--color-accent)) 0.5px, transparent 0.5px);
  background-size: 16px 16px;
}

.invite-body--pattern-confetti {
  background-image:
    radial-gradient(circle 2px, var(--event-accent, var(--color-accent)) 100%, transparent 100%),
    radial-gradient(circle 1.5px, var(--color-accent-secondary, var(--event-accent, var(--color-accent))) 100%, transparent 100%);
  background-size: 40px 40px, 30px 30px;
  background-position: 0 0, 15px 20px;
}

.invite-body--pattern-botanical {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 10 Q50 30 40 50 Q30 30 40 10Z' fill='none' stroke='%23787890' stroke-width='0.5' opacity='0.12'/%3E%3Cpath d='M20 40 Q30 50 20 70' fill='none' stroke='%23787890' stroke-width='0.5' opacity='0.08'/%3E%3C/svg%3E");
  background-size: 80px 80px;
}

.invite-body--pattern-geometric {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpolygon points='30,5 55,20 55,50 30,65 5,50 5,20' fill='none' stroke='%23787890' stroke-width='0.4' opacity='0.08'/%3E%3C/svg%3E");
  background-size: 60px 60px;
}

/* Pattern opacity — keep all patterns very subtle */
.invite-body[class*="pattern-"] {
  background-color: var(--color-bg, var(--color-background));
}

/* ── Light mode forced ──────────────── */
.invite-page.light-forced {
  color-scheme: light;
}

/* ── PIN gate ───────────────────────── */
.invite-pin-gate {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  min-height: 100dvh;
  background: var(--color-bg, var(--color-background));
}

.invite-pin-gate__card {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.08));
  overflow: hidden;
}

.invite-pin-gate__cover {
  height: 180px;
  overflow: hidden;
}

.invite-pin-gate__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.invite-pin-gate__body {
  padding: var(--space-8) var(--space-6);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.invite-pin-gate__greeting {
  font-family: var(--font-family-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.invite-pin-gate__event-title {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4) 0;
}

.invite-pin-gate__form {
  width: 100%;
  margin-top: var(--space-4);
}

.invite-pin-gate__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.invite-pin-gate__hint {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-4) 0;
  line-height: var(--line-height-relaxed);
}

.invite-pin-gate__input {
  width: 100%;
  padding: var(--space-4);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  font-family: monospace;
  text-align: center;
  letter-spacing: 0.3em;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg, var(--color-background));
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 200ms ease;
}

.invite-pin-gate__input:focus {
  border-color: var(--event-accent, var(--color-accent));
}

.invite-pin-gate__error {
  font-size: var(--text-sm);
  color: var(--color-error, #e74c3c);
  margin: var(--space-2) 0 0 0;
}

.invite-pin-gate__submit {
  width: 100%;
  margin-top: var(--space-4);
}

.invite-pin-gate__divider {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-6) 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.invite-pin-gate__divider::before,
.invite-pin-gate__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

.invite-pin-gate__link {
  background: none;
  border: none;
  color: var(--event-accent, var(--color-accent));
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: background 150ms ease;
}

.invite-pin-gate__link:hover {
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 8%, transparent);
}

.invite-pin-gate__success-icon {
  color: var(--event-accent, var(--color-accent));
  margin-bottom: var(--space-2);
}

.invite-pin-gate__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  margin-top: var(--space-6);
}

.invite-pin-gate__actions .btn {
  width: 100%;
}
</style>
