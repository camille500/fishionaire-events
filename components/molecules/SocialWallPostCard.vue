<script setup>
const { t } = useI18n()

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  showModeration: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['heart', 'approve', 'reject', 'delete'])

function formatTimeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('socialWall.justNow')
  if (mins < 60) return t('socialWall.minutesAgo', { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('socialWall.hoursAgo', { count: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('socialWall.daysAgo', { count: days })
  return new Date(date).toLocaleDateString()
}

const statusBadgeClass = computed(() => {
  switch (props.post.status) {
    case 'approved': return 'post-card__badge--approved'
    case 'rejected': return 'post-card__badge--rejected'
    default: return 'post-card__badge--pending'
  }
})
</script>

<template>
  <div class="post-card" :class="{ 'post-card--pending': post.status === 'pending', 'post-card--rejected': post.status === 'rejected' }">
    <div class="post-card__header">
      <div class="post-card__avatar">
        {{ (post.guestName || post.guestEmail || '?')[0].toUpperCase() }}
      </div>
      <div class="post-card__meta">
        <span class="post-card__name">{{ post.guestName || post.guestEmail }}</span>
        <span class="post-card__time">{{ formatTimeAgo(post.createdAt) }}</span>
      </div>
      <span v-if="showModeration" class="post-card__badge" :class="statusBadgeClass">
        {{ t(`socialWall.status.${post.status}`) }}
      </span>
    </div>

    <p class="post-card__content">{{ post.content }}</p>

    <img
      v-if="post.imageUrl"
      :src="post.imageUrl"
      :alt="t('socialWall.postImage')"
      class="post-card__image"
      loading="lazy"
    />

    <div class="post-card__footer">
      <HeartButton
        :count="post.hearts"
        :disabled="showModeration"
        @heart="emit('heart', post.id)"
      />

      <div v-if="showModeration" class="post-card__actions">
        <button
          v-if="post.status !== 'approved'"
          class="post-card__action post-card__action--approve"
          @click="emit('approve', post.id)"
        >
          <Icon name="lucide:check" size="14" />
          {{ t('socialWall.approve') }}
        </button>
        <button
          v-if="post.status !== 'rejected'"
          class="post-card__action post-card__action--reject"
          @click="emit('reject', post.id)"
        >
          <Icon name="lucide:x" size="14" />
          {{ t('socialWall.reject') }}
        </button>
        <button
          class="post-card__action post-card__action--delete"
          @click="emit('delete', post.id)"
        >
          <Icon name="lucide:trash-2" size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-fast);
}

.post-card:hover {
  border-color: var(--color-border);
}

.post-card--pending {
  border-color: color-mix(in srgb, var(--color-warning, #f0ad4e) 40%, var(--color-border-light));
  background: color-mix(in srgb, var(--color-warning, #f0ad4e) 3%, transparent);
}

.post-card--rejected {
  opacity: 0.6;
}

.post-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.post-card__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.post-card__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.post-card__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-card__time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.post-card__badge {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.post-card__badge--pending {
  color: var(--color-warning, #f0ad4e);
  background: color-mix(in srgb, var(--color-warning, #f0ad4e) 10%, transparent);
}

.post-card__badge--approved {
  color: var(--color-success, #27ae60);
  background: color-mix(in srgb, var(--color-success, #27ae60) 10%, transparent);
}

.post-card__badge--rejected {
  color: var(--color-error, #e74c3c);
  background: color-mix(in srgb, var(--color-error, #e74c3c) 10%, transparent);
}

.post-card__content {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-card__image {
  border-radius: var(--radius-md);
  max-height: 300px;
  width: 100%;
  object-fit: cover;
}

.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-card__actions {
  display: flex;
  gap: var(--space-1);
}

.post-card__action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.post-card__action--approve {
  color: var(--color-success, #27ae60);
}

.post-card__action--approve:hover {
  background: color-mix(in srgb, var(--color-success, #27ae60) 10%, transparent);
}

.post-card__action--reject {
  color: var(--color-text-muted);
}

.post-card__action--reject:hover {
  color: var(--color-warning, #f0ad4e);
  background: color-mix(in srgb, var(--color-warning, #f0ad4e) 10%, transparent);
}

.post-card__action--delete {
  color: var(--color-text-muted);
}

.post-card__action--delete:hover {
  color: var(--color-error, #e74c3c);
  background: color-mix(in srgb, var(--color-error, #e74c3c) 10%, transparent);
}
</style>
