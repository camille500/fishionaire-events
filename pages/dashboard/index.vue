<script setup>
definePageMeta({ layout: 'dashboard' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getGreeting } = useGreeting()

const { data: user } = await useFetch('/api/users/me')
const { data: events, error: eventsError, refresh: refreshEvents } = await useFetch('/api/events')
const { subscription } = useSubscription()
const { stats } = useDashboardStats(computed(() => events.value))

const showCreateForm = ref(false)

const displayName = computed(() => user.value?.firstName || 'User')

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const recentEvents = computed(() => {
  const owned = events.value?.owned || []
  return owned.slice(0, 4)
})

const mockActivities = computed(() => {
  const owned = events.value?.owned || []
  if (!owned.length) return []
  return owned.slice(0, 3).map((e) => ({
    icon: 'calendar',
    message: t('dashboard.activity.eventCreated', { name: e.title }),
    timestamp: new Date(e.createdAt).toLocaleDateString(locale.value),
    color: 'var(--color-accent)',
  }))
})

function onEventCreated() {
  showCreateForm.value = false
  refreshEvents()
}
</script>

<template>
  <div class="dashboard-home">
    <!-- Greeting -->
    <section class="dashboard-home__greeting dashboard-home__animated">
      <div>
        <h1 class="dashboard-home__title">{{ getGreeting(displayName) }}</h1>
        <p class="dashboard-home__date">{{ todayFormatted }}</p>
      </div>
      <TierBadge v-if="subscription" :tier="subscription.tier" />
    </section>

    <!-- Stats -->
    <section class="dashboard-home__stats">
      <StatsOverview :stats="stats" />
    </section>

    <!-- Quick Actions -->
    <section class="dashboard-home__quick-actions">
      <QuickActions @create-event="showCreateForm = true" />
    </section>

    <!-- Create Event Form (slide) -->
    <Transition name="slide-down">
      <section v-if="showCreateForm" class="dashboard-home__create-form">
        <CreateEventForm
          @created="onEventCreated"
          @cancel="showCreateForm = false"
        />
      </section>
    </Transition>

    <!-- Content Grid -->
    <div class="dashboard-home__grid">
      <!-- Left column: Events -->
      <div class="dashboard-home__main-col">
        <div class="dashboard-home__section-header">
          <h2 class="dashboard-home__section-title">
            <AppIcon name="calendar" size="sm" />
            {{ t('dashboard.myEvents') }}
          </h2>
          <NuxtLink
            v-if="recentEvents.length > 0"
            :to="localePath('dashboard') + '/events'"
            class="dashboard-home__view-all"
          >
            {{ t('dashboard.viewAll') }}
            <AppIcon name="arrow-right" size="sm" />
          </NuxtLink>
        </div>

        <div v-if="eventsError" class="dashboard-home__error">
          <AppText size="sm">{{ t('dashboard.errorLoading') }}</AppText>
          <AppButton variant="ghost" size="sm" @click="refreshEvents()">
            {{ t('dashboard.retry') }}
          </AppButton>
        </div>

        <div v-else-if="recentEvents.length" class="dashboard-home__events-grid">
          <EventCard
            v-for="(event, index) in recentEvents"
            :key="event.id"
            class="dashboard-home__card-animated"
            :style="{ animationDelay: `${200 + index * 80}ms` }"
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
          @cta-click="showCreateForm = true"
        />

        <!-- Invitations section -->
        <div class="dashboard-home__section-header dashboard-home__section-header--mt">
          <h2 class="dashboard-home__section-title">
            <AppIcon name="inbox" size="sm" />
            {{ t('dashboard.invitations') }}
          </h2>
        </div>

        <div v-if="(events?.invited || []).length" class="dashboard-home__events-grid">
          <EventCard
            v-for="(event, index) in (events?.invited || []).slice(0, 4)"
            :key="event.id"
            class="dashboard-home__card-animated"
            :style="{ animationDelay: `${300 + index * 80}ms` }"
            :event="event"
            :is-owner="false"
          />
        </div>

        <EmptyState
          v-else
          icon="inbox"
          :title="t('dashboard.emptyState.noInvitations.title')"
          :description="t('dashboard.emptyState.noInvitations.description')"
        />
      </div>

      <!-- Right column: Activity + Timeline -->
      <div class="dashboard-home__side-col">
        <ActivityFeed :activities="mockActivities" />
        <UpcomingEventsTimeline :events="recentEvents" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-home {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.dashboard-home__greeting {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.dashboard-home__title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.dashboard-home__date {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: var(--space-2) 0 0;
  text-transform: capitalize;
}

.dashboard-home__grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--space-8);
}

.dashboard-home__main-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.dashboard-home__side-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.dashboard-home__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-home__section-header--mt {
  margin-top: var(--space-4);
}

.dashboard-home__section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.dashboard-home__view-all {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
  text-decoration: none;
  transition: gap var(--transition-fast);
}

.dashboard-home__view-all:hover {
  gap: var(--space-2);
}

.dashboard-home__events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.dashboard-home__create-form {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.dashboard-home__error {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.dashboard-home__animated {
  animation: fade-slide-up 300ms ease both;
}

.dashboard-home__card-animated {
  animation: fade-slide-up 300ms ease both;
}

@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-base);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1024px) {
  .dashboard-home__grid {
    grid-template-columns: 1fr;
  }

  .dashboard-home__side-col {
    flex-direction: row;
  }

  .dashboard-home__side-col > * {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .dashboard-home__title {
    font-size: var(--text-2xl);
  }

  .dashboard-home__greeting {
    flex-direction: column;
  }

  .dashboard-home__side-col {
    flex-direction: column;
  }

  .dashboard-home__events-grid {
    grid-template-columns: 1fr;
  }
}
</style>
