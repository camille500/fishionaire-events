<script setup>
const props = defineProps({
  guestName: { type: String, default: null },
  content: { type: String, required: true },
  createdAt: { type: String, required: true },
  isMe: { type: Boolean, default: false },
})

const { t } = useI18n()

const timeAgo = computed(() => {
  const now = Date.now()
  const then = new Date(props.createdAt).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMin < 1) return t('wishlist.chat.justNow')
  if (diffMin < 60) return t('wishlist.chat.minutesAgo', { count: diffMin })
  if (diffHours < 24) return t('wishlist.chat.hoursAgo', { count: diffHours })
  return new Date(props.createdAt).toLocaleDateString()
})

const initials = computed(() => {
  if (!props.guestName) return '?'
  return props.guestName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})
</script>

<template>
  <div class="wishlist-bubble" :class="{ 'wishlist-bubble--mine': isMe }">
    <div v-if="!isMe" class="wishlist-bubble__avatar">
      {{ initials }}
    </div>
    <div class="wishlist-bubble__body">
      <span v-if="!isMe" class="wishlist-bubble__name">{{ guestName || '?' }}</span>
      <p class="wishlist-bubble__text">{{ content }}</p>
      <span class="wishlist-bubble__time">{{ timeAgo }}</span>
    </div>
  </div>
</template>

<style scoped>
.wishlist-bubble {
  display: flex;
  gap: var(--space-2);
  max-width: 80%;
  animation: bubble-in 200ms ease-out;
}

.wishlist-bubble--mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.wishlist-bubble:not(.wishlist-bubble--mine) {
  align-self: flex-start;
}

.wishlist-bubble__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 16px;
}

.wishlist-bubble__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wishlist-bubble__name {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 0 var(--space-1);
}

.wishlist-bubble--mine .wishlist-bubble__body .wishlist-bubble__text {
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
}

.wishlist-bubble:not(.wishlist-bubble--mine) .wishlist-bubble__body .wishlist-bubble__text {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
}

.wishlist-bubble__text {
  font-size: var(--text-sm);
  line-height: var(--line-height-normal);
  margin: 0;
  padding: var(--space-2) var(--space-3);
  white-space: pre-wrap;
  word-break: break-word;
}

.wishlist-bubble__time {
  font-size: 10px;
  color: var(--color-text-muted);
  padding: 0 var(--space-1);
}

.wishlist-bubble--mine .wishlist-bubble__time {
  text-align: right;
}

@keyframes bubble-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
