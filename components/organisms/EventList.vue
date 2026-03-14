<script setup>
import { vAutoAnimate } from '@formkit/auto-animate'

const { t } = useI18n()

defineProps({
  events: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  isOwnerList: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['invited'])
</script>

<template>
  <section class="event-list">
    <AppHeading :level="2" class="event-list__title">{{ title }}</AppHeading>

    <div v-if="events.length === 0" class="event-list__empty">
      <div class="event-list__empty-icon">
        <Icon name="lucide:calendar" size="32" />
      </div>
      <AppText class="event-list__empty-text">
        {{ isOwnerList ? t('dashboard.noEvents') : t('dashboard.noInvitations') }}
      </AppText>
    </div>

    <div v-else v-auto-animate class="event-list__grid">
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        :is-owner="isOwnerList"
        @invited="emit('invited')"
      />
    </div>
  </section>
</template>

<style scoped>
.event-list {
  margin-top: var(--space-8);
}

.event-list__title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-4);
}

.event-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);
}

.event-list__empty-icon {
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.event-list__empty-text {
  color: var(--color-text-muted);
  text-align: center;
}

.event-list__grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
