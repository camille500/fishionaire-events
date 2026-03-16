<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const { data: events } = await useFetch('/api/events')

const invitations = computed(() => events.value?.invited || [])
</script>

<template>
  <div class="invitations-page">
    <h1 class="invitations-page__title">{{ t('dashboard.invitations') }}</h1>

    <div v-if="invitations.length" class="invitations-page__grid">
      <EventCard
        v-for="event in invitations"
        :key="event.id"
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
</template>

<style scoped>
.invitations-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 960px;
  margin: 0 auto;
}

.invitations-page__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.invitations-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
</style>
