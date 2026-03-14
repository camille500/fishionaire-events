<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const { data: events, error, refresh: refreshEvents } = await useFetch('/api/events')

const searchQuery = ref('')
const showArchived = ref(false)

const filteredEvents = computed(() => {
  const owned = events.value?.owned || []
  if (!searchQuery.value) return owned
  const q = searchQuery.value.toLowerCase()
  return owned.filter((e) => e.title.toLowerCase().includes(q))
})

const coOrganizingEvents = computed(() => events.value?.coOrganizing || [])
const archivedEvents = computed(() => events.value?.archived || [])

function openCreateWizard() {
  navigateTo('/dashboard/events/create')
}

async function onDuplicate(event) {
  const result = await $fetch(`/api/events/${event.id}/duplicate`, { method: 'POST' })
  navigateTo(`/dashboard/events/${result.id}`)
}

async function onArchive(event) {
  await $fetch(`/api/events/${event.id}`, { method: 'DELETE' })
  refreshEvents()
}

async function onRestore(event) {
  await $fetch(`/api/events/${event.id}/restore`, { method: 'POST' })
  refreshEvents()
}
</script>

<template>
  <div class="events-page">
    <!-- Header row -->
    <div class="events-page__header">
      <h1 class="events-page__title">{{ t('dashboard.sidebar.events') }}</h1>
      <div class="events-page__header-actions">
        <div class="events-page__search">
          <Icon name="lucide:search" size="15" class="events-page__search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            class="events-page__search-input"
            :placeholder="t('dashboard.searchEvents')"
          />
        </div>
        <AppButton variant="primary" size="sm" @click="openCreateWizard">
          <Icon name="lucide:plus" size="14" />
          {{ t('dashboard.newEvent') }}
        </AppButton>
      </div>
    </div>

    <div v-if="error" class="events-page__error">
      <AppText size="sm">{{ t('dashboard.errorLoading') }}</AppText>
      <AppButton variant="ghost" size="sm" @click="refreshEvents()">
        {{ t('dashboard.retry') }}
      </AppButton>
    </div>

    <div v-else-if="filteredEvents.length" class="events-page__grid">
      <EventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
        :is-owner="true"
        role="owner"
        @invited="refreshEvents"
        @duplicate="onDuplicate"
        @archive="onArchive"
      />
    </div>

    <!-- Co-organizing -->
    <template v-if="coOrganizingEvents.length">
      <h2 class="events-page__section-title">{{ t('dashboard.coOrganizing') }}</h2>
      <div class="events-page__grid">
        <EventCard
          v-for="event in coOrganizingEvents"
          :key="'co-' + event.id"
          :event="event"
          role="co_organizer"
        />
      </div>
    </template>

    <!-- Archived -->
    <template v-if="archivedEvents.length">
      <button class="events-page__archived-toggle" @click="showArchived = !showArchived">
        <Icon :name="showArchived ? 'lucide:chevron-down' : 'lucide:chevron-right'" size="14" />
        {{ t('dashboard.archivedEvents') }}
        <span class="events-page__archived-count">{{ archivedEvents.length }}</span>
      </button>

      <Transition name="slide-down">
        <div v-if="showArchived" class="events-page__archived-list">
          <div
            v-for="event in archivedEvents"
            :key="'archived-' + event.id"
            class="events-page__archived-item"
          >
            <div class="events-page__archived-info">
              <Icon name="lucide:archive" size="14" class="events-page__archived-icon" />
              <span class="events-page__archived-title">{{ event.title }}</span>
            </div>
            <button class="events-page__restore-btn" @click="onRestore(event)">
              <Icon name="lucide:archive-restore" size="14" />
              {{ t('dashboard.eventEditor.restoreEvent') }}
            </button>
          </div>
        </div>
      </Transition>
    </template>

    <EmptyState
      v-if="!filteredEvents.length && !coOrganizingEvents.length && !error"
      icon="calendar"
      :title="searchQuery ? t('dashboard.emptyState.noResults.title') : t('dashboard.emptyState.noEvents.title')"
      :description="searchQuery ? t('dashboard.emptyState.noResults.description') : t('dashboard.emptyState.noEvents.description')"
      :cta-label="searchQuery ? '' : t('dashboard.emptyState.noEvents.cta')"
      @cta-click="openCreateWizard"
    />
  </div>
</template>

<style scoped>
.events-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 960px;
}

.events-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.events-page__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.events-page__header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Notion-style search */
.events-page__search {
  position: relative;
}

.events-page__search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.events-page__search-input {
  width: 220px;
  padding: var(--space-2) var(--space-3) var(--space-2) calc(var(--space-3) + 20px + var(--space-2));
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
  color: var(--color-text-primary);
  outline: none;
  transition: all var(--transition-fast);
}

.events-page__search-input:focus {
  background: var(--color-surface);
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
  width: 280px;
}

.events-page__search-input::placeholder {
  color: var(--color-text-muted);
}

.events-page__section-title {
  font-family: var(--font-family-heading);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.events-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

/* Archived section */
.events-page__archived-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0;
  border: none;
  background: none;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.events-page__archived-toggle:hover {
  color: var(--color-text-primary);
}

.events-page__archived-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 var(--space-1);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  font-size: 11px;
  color: var(--color-text-muted);
}

.events-page__archived-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.events-page__archived-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
}

.events-page__archived-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.events-page__archived-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.events-page__archived-title {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.events-page__restore-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  background: none;
  font: inherit;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.events-page__restore-btn:hover {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
}

.events-page__error {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
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

@media (max-width: 640px) {
  .events-page__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .events-page__header-actions {
    width: 100%;
  }

  .events-page__search-input {
    width: 100%;
  }

  .events-page__search-input:focus {
    width: 100%;
  }

  .events-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
