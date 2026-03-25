<script setup>
definePageMeta({ layout: false })

const { t, locale } = useI18n()
const route = useRoute()
const shareToken = String(route.params.shareToken)

const { data: eventData, error } = await useFetch(`/api/events/public/${shareToken}`)

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

// Color mode override
const colorModeOverride = computed(() => eventData.value?.colorMode || 'auto')

// Branding
const showBranding = computed(() => !eventData.value?.hideBranding)

const formattedDate = computed(() => {
  if (!eventData.value?.eventDate) return null
  const d = new Date(eventData.value.eventDate)
  const loc = locale.value === 'nl' ? 'nl-NL' : 'en-GB'
  return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const ogTitle = computed(() => eventData.value?.title || 'Fishionaire Events')
const ogDescription = computed(() => {
  const parts = []
  if (formattedDate.value) parts.push(formattedDate.value)
  if (eventData.value?.location) parts.push(eventData.value.location)
  if (eventData.value?.description) parts.push(eventData.value.description.slice(0, 120))
  return parts.join(' \u2022 ') || t('seo.home.description')
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

useHead({ title: ogTitle })
</script>

<template>
  <div
    class="event-public"
    :class="[
      colorModeOverride === 'dark' ? 'dark' : '',
      colorModeOverride === 'light' ? 'light-forced' : '',
    ]"
    :style="allThemeStyles"
  >
    <!-- Error -->
    <div v-if="error" class="event-public__center">
      <div class="event-public__error-card">
        <Icon name="lucide:alert-circle" size="48" class="event-public__error-icon" />
        <AppHeading :level="1" size="lg">{{ t('invite.error.title') }}</AppHeading>
        <AppText muted>{{ t('invite.error.description') }}</AppText>
      </div>
    </div>

    <template v-else-if="eventData">
      <!-- Hero -->
      <header class="event-public__hero">
        <div
          v-if="eventData.coverImageUrl"
          class="event-public__hero-bg"
          :style="{ backgroundImage: `url(${eventData.coverImageUrl})` }"
        />
        <div v-else class="event-public__hero-bg event-public__hero-bg--gradient" />
        <div class="event-public__hero-overlay" />

        <div class="event-public__hero-content">
          <div v-if="eventData.customLogoUrl" class="event-public__logo">
            <img :src="eventData.customLogoUrl" alt="" class="event-public__custom-logo" />
          </div>
          <div v-else-if="showBranding" class="event-public__logo">
            <NuxtLink to="/" class="event-public__logo-link">Fishionaire</NuxtLink>
          </div>

          <div class="event-public__hero-text">
            <div v-if="eventData.eventType" class="event-public__type-badge">
              {{ t(`dashboard.eventEditor.eventTypes.${eventData.eventType}`) }}
            </div>
            <h1 class="event-public__title">{{ eventData.title }}</h1>
            <div class="event-public__meta">
              <span v-if="formattedDate" class="event-public__meta-item">
                <Icon name="lucide:calendar" size="16" />
                {{ formattedDate }}
              </span>
              <span v-if="eventData.location" class="event-public__meta-item">
                <Icon name="lucide:map-pin" size="16" />
                {{ eventData.location }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Auth gate -->
      <main class="event-public__body">
        <div class="event-public__card">
          <InviteAuthGate />
        </div>
      </main>

      <footer v-if="showBranding" class="event-public__footer">
        <AppText size="xs" muted>
          Powered by <NuxtLink to="/" class="event-public__footer-link">Fishionaire</NuxtLink>
        </AppText>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.event-public {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg, var(--color-background));
}

.event-public__center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.event-public__error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.event-public__error-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
}

/* Hero — reuses same pattern as invite page */
.event-public__hero {
  position: relative;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.event-public__hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.event-public__hero-bg--gradient {
  background: var(--gradient-accent, linear-gradient(135deg, var(--event-accent, var(--color-accent)), color-mix(in srgb, var(--color-accent-secondary, var(--event-accent, var(--color-accent))) 60%, #1a1a2e)));
}

.event-public__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.1) 100%);
}

.event-public__hero-content {
  position: relative;
  z-index: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.event-public__logo {
  opacity: 0.8;
}

.event-public__logo-link {
  color: #fff;
  text-decoration: none;
  font-family: var(--font-family-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.02em;
}

.event-public__hero-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 640px;
}

.event-public__type-badge {
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

.event-public__title {
  font-family: var(--font-family-heading);
  font-size: clamp(var(--text-2xl), 5vw, var(--text-4xl));
  font-weight: var(--font-weight-bold);
  color: #fff;
  line-height: var(--line-height-tight);
  margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.event-public__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.event-public__meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--text-sm);
}

.event-public__body {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: var(--space-6);
  margin-top: calc(-1 * var(--space-4));
  position: relative;
  z-index: 2;
}

.event-public__card {
  width: 100%;
  max-width: 480px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  animation: fadeInUp 500ms ease-out both;
}

.event-public__footer {
  padding: var(--space-6);
  text-align: center;
}

.event-public__footer-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.event-public__custom-logo {
  max-height: 40px;
  max-width: 160px;
  object-fit: contain;
}

.event-public.light-forced {
  color-scheme: light;
}

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

@media (max-width: 640px) {
  .event-public__hero {
    min-height: 240px;
  }

  .event-public__hero-content {
    padding: var(--space-4);
  }

  .event-public__body {
    padding: var(--space-4);
  }
}
</style>
