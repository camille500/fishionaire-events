<script setup>
definePageMeta({ layout: 'dashboard' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getGreeting } = useGreeting()

const { data: user } = await useFetch('/api/users/me')
const { data: events, error: eventsError, refresh: refreshEvents } = await useFetch('/api/events')
const { subscription } = useSubscription()

const showConfetti = ref(false)

const displayName = computed(() => user.value?.firstName || 'User')

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const ownedEvents = computed(() => events.value?.owned || [])
const coOrgEvents = computed(() => events.value?.coOrganizing || [])
const invitedEvents = computed(() => events.value?.invited || [])

const now = new Date()

const upcomingEvents = computed(() =>
  ownedEvents.value
    .filter(e => e.eventDate && new Date(e.eventDate) >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
)

const pastEvents = computed(() =>
  ownedEvents.value
    .filter(e => !e.eventDate || new Date(e.eventDate) < now)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
)

const nextEvent = computed(() => upcomingEvents.value[0] || null)

const recentEvents = computed(() => ownedEvents.value.slice(0, 6))

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function countdownLabel(dateStr) {
  const days = daysUntil(dateStr)
  if (days === null) return ''
  if (days === 0) return t('dashboard.upcoming.today')
  if (days === 1) return t('dashboard.upcoming.tomorrow')
  return t('dashboard.upcoming.inDays', { count: days })
}

const showPastEvents = ref(false)

const isFirstTimeUser = computed(() => {
  return ownedEvents.value.length === 0 && coOrgEvents.value.length === 0 && invitedEvents.value.length === 0
})

const inlineStats = computed(() => {
  const owned = ownedEvents.value
  const invited = invitedEvents.value
  const totalGuests = owned.reduce((sum, e) => sum + (e.invitationCount || 0), 0)
  return [
    { value: owned.length, label: t('dashboard.stats.totalEvents') },
    { value: invited.length, label: t('dashboard.stats.invitations') },
    { value: totalGuests, label: t('dashboard.stats.totalGuests') },
  ]
})

function openCreateWizard() {
  navigateTo('/dashboard/events/create')
}
</script>

<template>
  <div class="dashboard-home">
    <ConfettiExplosion :trigger="showConfetti" />

    <!-- First-time user: Welcome state -->
    <DashboardWelcome v-if="isFirstTimeUser && !eventsError" />

    <!-- Returning user: Bento grid -->
    <template v-else>
      <!-- Bento grid -->
      <div class="dashboard-home__bento">
        <!-- Greeting (spans 2 cols) -->
        <section class="dashboard-home__greeting bento-greeting">
          <div>
            <h1 class="dashboard-home__title">{{ getGreeting(displayName) }}</h1>
            <p class="dashboard-home__date">{{ todayFormatted }}</p>
          </div>
          <InlineStats :stats="inlineStats" />
        </section>

        <!-- Quick Create (1 col) -->
        <section class="bento-quick-create">
          <QuickCreateCard />
        </section>

        <!-- Next Event Hero -->
        <section v-if="nextEvent" class="bento-next-event">
          <NuxtLink :to="`/dashboard/events/${nextEvent.id}`" class="next-event-card">
            <div class="next-event-card__badge">
              {{ countdownLabel(nextEvent.eventDate) }}
            </div>
            <h3 class="next-event-card__title">{{ nextEvent.title }}</h3>
            <div class="next-event-card__meta">
              <span v-if="nextEvent.eventDate" class="next-event-card__date">
                <Icon name="lucide:calendar" size="14" />
                {{ new Date(nextEvent.eventDate).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }) }}
              </span>
              <span v-if="nextEvent.location" class="next-event-card__location">
                <Icon name="lucide:map-pin" size="14" />
                {{ nextEvent.location }}
              </span>
              <span v-if="nextEvent.invitationCount" class="next-event-card__guests">
                <Icon name="lucide:users" size="14" />
                {{ nextEvent.invitationCount }} {{ t('dashboard.stats.totalGuests').toLowerCase() }}
              </span>
            </div>
          </NuxtLink>
        </section>

        <!-- Upcoming Events -->
        <section class="bento-events">
          <div class="dashboard-home__section-header">
            <h2 class="dashboard-home__section-title">
              {{ t('dashboard.upcoming.title') }}
            </h2>
            <div class="dashboard-home__section-actions">
              <NuxtLink
                v-if="ownedEvents.length > 0"
                :to="localePath('dashboard') + '/events'"
                class="dashboard-home__view-all"
              >
                {{ t('dashboard.viewAll') }}
                <Icon name="lucide:arrow-right" size="14" />
              </NuxtLink>
              <AppButton
                variant="primary"
                size="sm"
                @click="openCreateWizard"
              >
                <Icon name="lucide:plus" size="14" />
                {{ t('dashboard.newEvent') }}
              </AppButton>
            </div>
          </div>

          <div v-if="eventsError" class="dashboard-home__error">
            <AppText size="sm">{{ t('dashboard.errorLoading') }}</AppText>
            <AppButton variant="ghost" size="sm" @click="refreshEvents()">
              {{ t('dashboard.retry') }}
            </AppButton>
          </div>

          <div v-else-if="upcomingEvents.length" class="dashboard-home__events-grid">
            <EventCard
              v-for="event in upcomingEvents"
              :key="event.id"
              :event="event"
              :is-owner="true"
              @invited="refreshEvents"
            />
          </div>

          <EmptyState
            v-else
            icon="calendar"
            :title="t('dashboard.emptyState.noEvents.title')"
            :description="t('dashboard.emptyState.noEvents.description')"
            :cta-label="t('dashboard.emptyState.noEvents.cta')"
            @cta-click="openCreateWizard"
          />
        </section>

        <!-- Past Events (collapsible) -->
        <section v-if="pastEvents.length" class="bento-past-events">
          <button class="dashboard-home__collapsible-header" @click="showPastEvents = !showPastEvents">
            <h2 class="dashboard-home__section-title">
              {{ t('dashboard.upcoming.pastEvents') }}
              <span class="dashboard-home__count-badge">{{ pastEvents.length }}</span>
            </h2>
            <Icon
              :name="showPastEvents ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              size="16"
              class="dashboard-home__collapse-icon"
            />
          </button>
          <div v-if="showPastEvents" class="dashboard-home__events-grid">
            <EventCard
              v-for="event in pastEvents.slice(0, 6)"
              :key="'past-' + event.id"
              :event="event"
              :is-owner="true"
            />
          </div>
        </section>

        <!-- Co-organizing -->
        <section v-if="coOrgEvents.length" class="bento-co-org">
          <div class="dashboard-home__section-header">
            <h2 class="dashboard-home__section-title">
              {{ t('dashboard.coOrganizing') }}
            </h2>
          </div>
          <div class="dashboard-home__events-grid dashboard-home__events-grid--compact">
            <EventCard
              v-for="event in coOrgEvents.slice(0, 4)"
              :key="'co-' + event.id"
              :event="event"
              role="co_organizer"
            />
          </div>
        </section>

        <!-- Invitations -->
        <section v-if="invitedEvents.length" class="bento-invitations">
          <div class="dashboard-home__section-header">
            <h2 class="dashboard-home__section-title">
              {{ t('dashboard.invitations') }}
            </h2>
          </div>
          <div class="dashboard-home__events-grid dashboard-home__events-grid--compact">
            <EventCard
              v-for="event in invitedEvents.slice(0, 4)"
              :key="'inv-' + event.id"
              :event="event"
              :is-owner="false"
            />
          </div>
        </section>

        <!-- Empty invitations -->
        <section v-if="!invitedEvents.length && ownedEvents.length" class="bento-invitations">
          <div class="dashboard-home__section-header">
            <h2 class="dashboard-home__section-title">
              {{ t('dashboard.invitations') }}
            </h2>
          </div>
          <EmptyState
            icon="inbox"
            :title="t('dashboard.emptyState.noInvitations.title')"
            :description="t('dashboard.emptyState.noInvitations.description')"
          />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-home {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: var(--max-width-dashboard, 1400px);
}

/* Bento grid */
.dashboard-home__bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-areas:
    "greeting greeting quick-create"
    "next-event next-event next-event"
    "events events events"
    "past-events past-events past-events"
    "co-org co-org invitations";
  gap: var(--space-4);
}

.bento-greeting {
  grid-area: greeting;
}

.bento-quick-create {
  grid-area: quick-create;
}

.bento-events {
  grid-area: events;
}

.bento-co-org {
  grid-area: co-org;
}

.bento-invitations {
  grid-area: invitations;
}

.bento-next-event {
  grid-area: next-event;
}

.bento-past-events {
  grid-area: past-events;
}

/* Next Event Card */
.next-event-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, var(--color-accent-violet)));
  border-radius: var(--radius-xl);
  color: #fff;
  text-decoration: none;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.next-event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-accent) 30%, transparent);
}

.next-event-card__badge {
  display: inline-flex;
  align-self: flex-start;
  padding: var(--space-1) var(--space-3);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.next-event-card__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  line-height: var(--line-height-tight);
}

.next-event-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  font-size: var(--text-sm);
  opacity: 0.85;
}

.next-event-card__date,
.next-event-card__location,
.next-event-card__guests {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

/* Collapsible header */
.dashboard-home__collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-3) 0;
  margin-bottom: var(--space-4);
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-family);
  color: var(--color-text-primary);
}

.dashboard-home__count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 var(--space-2);
  margin-left: var(--space-2);
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.dashboard-home__collapse-icon {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

/* Greeting */
.dashboard-home__greeting {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
}

.dashboard-home__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.dashboard-home__date {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: var(--space-1) 0 0;
  text-transform: capitalize;
}

/* Section headers */
.dashboard-home__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.dashboard-home__section-title {
  font-family: var(--font-family-heading);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.dashboard-home__section-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.dashboard-home__view-all {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.dashboard-home__view-all:hover {
  color: var(--color-accent);
}

/* Event grids */
.dashboard-home__events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.dashboard-home__events-grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.dashboard-home__error {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

/* Mobile: stack to single column */
@media (max-width: 768px) {
  .dashboard-home__bento {
    grid-template-columns: 1fr;
    grid-template-areas:
      "quick-create"
      "greeting"
      "next-event"
      "events"
      "past-events"
      "co-org"
      "invitations";
  }

  .dashboard-home__title {
    font-size: var(--text-xl);
  }

  .dashboard-home__greeting {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-home__section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .dashboard-home__events-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-home__events-grid--compact {
    grid-template-columns: 1fr;
  }
}
</style>
