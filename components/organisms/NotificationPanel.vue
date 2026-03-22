<script setup>
const { t } = useI18n()
const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()

const isOpen = ref(false)

async function handleOpen(open) {
  if (open) {
    isOpen.value = true
    await fetchNotifications()
  } else {
    isOpen.value = false
  }
}

function handleNotificationClick(notification) {
  isOpen.value = false
}

async function handleMarkAllRead() {
  await markAllAsRead()
}
</script>

<template>
  <UPopover :open="isOpen" @update:open="handleOpen">
    <button class="notification-bell" :class="{ 'notification-bell--has-unread': unreadCount > 0 }">
      <Icon name="lucide:bell" size="18" />
      <CountBadge v-if="unreadCount > 0" :count="unreadCount" class="notification-bell__badge" />
    </button>

    <template #content>
      <div class="notification-panel">
        <div class="notification-panel__header">
          <span class="notification-panel__title">{{ t('dashboard.notifications.title') }}</span>
          <button
            v-if="unreadCount > 0"
            class="notification-panel__mark-all"
            @click="handleMarkAllRead"
          >
            {{ t('dashboard.notifications.markAllRead') }}
          </button>
        </div>

        <div class="notification-panel__list">
          <div v-if="loading" class="notification-panel__loading">
            <Icon name="lucide:loader-2" size="20" class="notification-panel__spinner" />
          </div>
          <div v-else-if="notifications.length === 0" class="notification-panel__empty">
            <Icon name="lucide:bell-off" size="24" class="notification-panel__empty-icon" />
            <span class="notification-panel__empty-title">{{ t('dashboard.notifications.empty') }}</span>
            <span class="notification-panel__empty-desc">{{ t('dashboard.notifications.emptyDescription') }}</span>
          </div>
          <template v-else>
            <NotificationItem
              v-for="notification in notifications"
              :key="notification.id"
              :notification="notification"
              @mark-read="markAsRead"
              @click="handleNotificationClick"
            />
          </template>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<style scoped>
.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.notification-bell:hover {
  color: var(--color-text-primary);
  background: var(--color-background);
}

.notification-bell--has-unread {
  color: var(--color-text-primary);
}

.notification-bell__badge {
  position: absolute;
  top: 2px;
  right: 2px;
}

.notification-panel {
  width: 380px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
}

.notification-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.notification-panel__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.notification-panel__mark-all {
  font-size: var(--text-xs);
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.notification-panel__mark-all:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.notification-panel__list {
  overflow-y: auto;
  flex: 1;
  max-height: 420px;
}

.notification-panel__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.notification-panel__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.notification-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.notification-panel__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.notification-panel__empty-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.notification-panel__empty-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

@media (max-width: 480px) {
  .notification-panel {
    width: 320px;
  }
}
</style>
