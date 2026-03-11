<script setup>
const { t } = useI18n()
const localePath = useLocalePath()

const emit = defineEmits(['create-event'])
</script>

<template>
  <div class="quick-actions">
    <QuickActionCard
      v-motion
      :initial="{ opacity: 0, y: 16 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
      icon="plus"
      :label="t('dashboard.quickActions.createEvent')"
      :description="t('dashboard.quickActions.createEventDesc')"
      color="var(--color-accent)"
      @click="emit('create-event')"
    />
    <QuickActionCard
      v-motion
      :initial="{ opacity: 0, y: 16 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 180 } }"
      icon="inbox"
      :label="t('dashboard.quickActions.invitations')"
      :description="t('dashboard.quickActions.invitationsDesc')"
      :to="localePath('dashboard') + '/invitations'"
      color="var(--color-event-corporate)"
    />
    <QuickActionCard
      v-motion
      :initial="{ opacity: 0, y: 16 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 260 } }"
      icon="calendar"
      :label="t('dashboard.quickActions.myEvents')"
      :description="t('dashboard.quickActions.myEventsDesc')"
      :to="localePath('dashboard') + '/events'"
      color="var(--color-event-birthday)"
    />
  </div>
</template>

<style scoped>
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
