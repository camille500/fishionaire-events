<script setup>
definePageMeta({ layout: false })

const { t } = useI18n()
const route = useRoute()
const eventId = parseInt(route.params.id)

// Pre-fill email from query param (set when organizer copies the invite link)
const initialEmail = computed(() => route.query.email ? String(route.query.email) : '')

// Fetch event info for context
const { data: eventData } = await useFetch(`/api/events/${eventId}`)
</script>

<template>
  <div class="poll-page">
    <header class="poll-page__header">
      <NuxtLink to="/" class="poll-page__logo">
        Fishionaire
      </NuxtLink>
    </header>

    <main class="poll-page__main">
      <div class="poll-page__card">
        <!-- Event context -->
        <div v-if="eventData" class="poll-page__event-info">
          <div
            v-if="eventData.coverImageUrl"
            class="poll-page__cover"
            :style="{ backgroundImage: `url(${eventData.coverImageUrl})` }"
          />
          <AppHeading :level="1" size="lg" class="poll-page__title">{{ eventData.title }}</AppHeading>
          <AppText v-if="eventData.location" size="sm" muted class="poll-page__location">
            <Icon name="lucide:map-pin" size="14" />
            {{ eventData.location }}
          </AppText>
        </div>

        <AppDivider />

        <div class="poll-page__form-header">
          <AppHeading :level="2" size="sm">{{ t('editor.datePoll.guestVoting.title') }}</AppHeading>
          <AppText size="sm" muted>{{ t('editor.datePoll.guestVoting.subtitle') }}</AppText>
        </div>

        <DatePollVotingForm
          :event-id="eventId"
          :initial-email="initialEmail"
          :event-title="eventData?.title || ''"
        />
      </div>
    </main>

    <footer class="poll-page__footer">
      <AppText size="xs" muted>Powered by <NuxtLink to="/">Fishionaire</NuxtLink></AppText>
    </footer>
  </div>
</template>

<style scoped>
.poll-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.poll-page__header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
}

.poll-page__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.poll-page__main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
}

.poll-page__card {
  width: 100%;
  max-width: 560px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.poll-page__event-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.poll-page__cover {
  width: 100%;
  height: 140px;
  border-radius: var(--radius-lg);
  background-size: cover;
  background-position: center;
  margin-bottom: var(--space-2);
}

.poll-page__title {
  margin: 0;
}

.poll-page__location {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.poll-page__form-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.poll-page__footer {
  padding: var(--space-4) var(--space-6);
  text-align: center;
}

.poll-page__footer a {
  color: var(--color-accent);
  text-decoration: none;
}

@media (max-width: 600px) {
  .poll-page__card {
    border: none;
    border-radius: 0;
    padding: var(--space-6) var(--space-4);
  }
}
</style>
