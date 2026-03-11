<script setup>
const { t, locale } = useI18n()

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['invited'])

const showInviteForm = ref(false)

const formattedDate = computed(() => {
  return new Date(props.event.createdAt).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const badgeVariant = computed(() => {
  if (props.isOwner) return 'accent'
  if (props.event.status === 'accepted') return 'success'
  return 'default'
})

const badgeLabel = computed(() => {
  if (props.isOwner) return t('dashboard.owner')
  return t(`dashboard.${props.event.status}`)
})

function onInvited() {
  showInviteForm.value = false
  emit('invited')
}
</script>

<template>
  <div class="event-card">
    <div class="event-card__accent" />
    <div class="event-card__body">
      <div class="event-card__header">
        <div class="event-card__title-row">
          <div class="event-card__icon">
            <AppIcon name="calendar" size="sm" />
          </div>
          <div class="event-card__title-group">
            <h3 class="event-card__title">{{ event.title }}</h3>
            <span class="event-card__date">{{ formattedDate }}</span>
          </div>
        </div>
        <div class="event-card__badges">
          <TierBadge v-if="event.tier && event.tier !== 'free'" :tier="event.tier" />
          <AppBadge :label="badgeLabel" :variant="badgeVariant" />
        </div>
      </div>

      <div v-if="isOwner" class="event-card__stats">
        <div class="event-card__stat">
          <AppIcon name="users" size="sm" />
          <span>{{ event.invitationCount || 0 }} {{ t('dashboard.invited') }}</span>
        </div>
      </div>

      <div v-if="isOwner" class="event-card__actions">
        <AppButton
          variant="ghost"
          size="sm"
          :to="`/dashboard/events/${event.id}`"
        >
          <AppIcon name="settings" size="sm" />
          {{ t('dashboard.editEvent') }}
        </AppButton>
        <AppButton
          variant="ghost"
          size="sm"
          @click="showInviteForm = !showInviteForm"
        >
          <AppIcon name="mail" size="sm" />
          {{ t('dashboard.inviteByEmail') }}
        </AppButton>
      </div>

      <Transition name="slide-down">
        <div v-if="showInviteForm" class="event-card__invite">
          <InviteForm :event-id="event.id" @invited="onInvited" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.event-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  will-change: transform;
  display: flex;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.event-card__accent {
  width: 4px;
  background: var(--color-accent);
  flex-shrink: 0;
}

.event-card__body {
  flex: 1;
  padding: var(--space-4) var(--space-6);
  min-width: 0;
}

.event-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.event-card__title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  min-width: 0;
}

.event-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  flex-shrink: 0;
}

.event-card__title-group {
  min-width: 0;
}

.event-card__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary);
}

.event-card__date {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.event-card__badges {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.event-card__stats {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-3);
}

.event-card__stat {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.event-card__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.event-card__invite {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
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
</style>
