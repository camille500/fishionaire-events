<script setup>
const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click', 'mark-read'])

const localePath = useLocalePath()

const iconMap = {
  rsvp_update: 'user-check',
  wishlist_claim: 'gift',
  wishlist_purchase: 'shopping-bag',
  date_poll_vote: 'calendar-check',
  music_request: 'music',
  dietary: 'utensils',
  plus_one: 'user-plus',
  co_organizer_added: 'users',
  event_update: 'edit-3',
  event_reminder: 'clock',
  rsvp_nudge: 'bell-ring',
  system: 'info',
}

const colorMap = {
  rsvp_update: 'var(--color-accent)',
  wishlist_claim: 'var(--color-event-birthday)',
  wishlist_purchase: 'var(--color-success)',
  date_poll_vote: 'var(--color-event-corporate)',
  music_request: 'var(--color-event-wedding)',
  dietary: 'var(--color-event-dinner)',
  plus_one: 'var(--color-event-baby-shower, var(--color-accent))',
  co_organizer_added: 'var(--color-event-corporate)',
  event_update: 'var(--color-warning, #f59e0b)',
  event_reminder: 'var(--color-accent)',
  rsvp_nudge: 'var(--color-warning, #f59e0b)',
  system: 'var(--color-text-muted)',
}

const icon = computed(() => iconMap[props.notification.type] || 'bell')
const color = computed(() => colorMap[props.notification.type] || 'var(--color-text-muted)')

const timeAgo = computed(() => {
  const now = new Date()
  const date = new Date(props.notification.createdAt)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
})

function handleClick() {
  if (!props.notification.isRead) {
    emit('mark-read', props.notification.id)
  }
  if (props.notification.linkUrl) {
    navigateTo(localePath('dashboard') + props.notification.linkUrl.replace('/dashboard', ''))
  }
  emit('click', props.notification)
}
</script>

<template>
  <button
    class="notification-item"
    :class="{ 'notification-item--unread': !notification.isRead }"
    @click="handleClick"
  >
    <div class="notification-item__icon" :style="{ color }">
      <Icon :name="'lucide:' + icon" size="16" />
    </div>
    <div class="notification-item__content">
      <span class="notification-item__title">{{ notification.title }}</span>
      <span class="notification-item__body">{{ notification.body }}</span>
      <span class="notification-item__time">{{ timeAgo }}</span>
    </div>
    <div v-if="!notification.isRead" class="notification-item__dot" />
  </button>
</template>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
  border-radius: 0;
}

.notification-item:hover {
  background: var(--color-background);
}

.notification-item--unread {
  background: color-mix(in srgb, var(--color-accent) 4%, transparent);
}

.notification-item--unread:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.notification-item + .notification-item {
  border-top: 1px solid var(--color-border-light);
}

.notification-item__icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-item__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.notification-item--unread .notification-item__title {
  font-weight: var(--font-weight-semibold);
}

.notification-item__body {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-item__time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.notification-item__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  flex-shrink: 0;
  margin-top: 8px;
}
</style>
