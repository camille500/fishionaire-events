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

const recentEvents = computed(() => ownedEvents.value.slice(0, 6))

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

        <!-- My Events (full width) -->
        <section class="bento-events">
          <div class="dashboard-home__section-header">
            <h2 class="dashboard-home__section-title">
              {{ t('dashboard.myEvents') }}
            </h2>
            <div class="dashboard-home__section-actions">
              <NuxtLink
                v-if="recentEvents.length > 0"
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

          <div v-else-if="recentEvents.length" class="dashboard-home__events-grid">
            <EventCard
              v-for="event in recentEvents"
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
    "events events events"
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
      "events"
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
