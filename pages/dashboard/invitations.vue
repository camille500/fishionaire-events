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
        v-for="(event, index) in invitations"
        :key="event.id"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 60 } }"
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
}

.invitations-page__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.invitations-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}
</style>
