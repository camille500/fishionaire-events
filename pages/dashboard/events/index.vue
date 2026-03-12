<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const { data: events, error, refresh: refreshEvents } = await useFetch('/api/events')

const showCreateForm = ref(false)
const searchQuery = ref('')

const filteredEvents = computed(() => {
  const owned = events.value?.owned || []
  if (!searchQuery.value) return owned
  const q = searchQuery.value.toLowerCase()
  return owned.filter((e) => e.title.toLowerCase().includes(q))
})

function onEventCreated() {
  showCreateForm.value = false
  refreshEvents()
}
</script>

<template>
  <div class="events-page">
    <div class="events-page__header">
      <h1 class="events-page__title">{{ t('dashboard.sidebar.events') }}</h1>
      <AppButton variant="primary" @click="showCreateForm = !showCreateForm">
        <Icon name="lucide:plus" size="16" />
        {{ t('dashboard.newEvent') }}
      </AppButton>
    </div>

    <Transition name="slide-down">
      <div v-if="showCreateForm" class="events-page__form-wrapper">
        <CreateEventForm
          @created="onEventCreated"
          @cancel="showCreateForm = false"
        />
      </div>
    </Transition>

    <div class="events-page__search">
      <Icon name="lucide:search" size="16" class="events-page__search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        class="events-page__search-input"
        :placeholder="t('dashboard.searchEvents')"
      />
    </div>

    <div v-if="error" class="events-page__error">
      <AppText size="sm">{{ t('dashboard.errorLoading') }}</AppText>
      <AppButton variant="ghost" size="sm" @click="refreshEvents()">
        {{ t('dashboard.retry') }}
      </AppButton>
    </div>

    <div v-else-if="filteredEvents.length" class="events-page__grid">
      <EventCard
        v-for="(event, index) in filteredEvents"
        :key="event.id"
        class="events-page__card-animated"
        :style="{ animationDelay: `${index * 60}ms` }"
        :event="event"
        :is-owner="true"
        @invited="refreshEvents"
      />
    </div>

    <EmptyState
      v-else
      icon="calendar"
      :title="searchQuery ? t('dashboard.emptyState.noResults.title') : t('dashboard.emptyState.noEvents.title')"
      :description="searchQuery ? t('dashboard.emptyState.noResults.description') : t('dashboard.emptyState.noEvents.description')"
      :cta-label="searchQuery ? '' : t('dashboard.emptyState.noEvents.cta')"
      @cta-click="showCreateForm = true"
    />
  </div>
</template>

<style scoped>
.events-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.events-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.events-page__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.events-page__form-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.events-page__search {
  position: relative;
}

.events-page__search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.events-page__search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) calc(var(--space-4) + 24px + var(--space-2));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.events-page__search-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15);
}

.events-page__search-input::placeholder {
  color: var(--color-text-muted);
}

.events-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-base);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.events-page__error {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.events-page__card-animated {
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
</style>
