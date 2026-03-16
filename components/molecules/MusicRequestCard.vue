<script setup>
const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  canVote: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['upvote'])
</script>

<template>
  <div class="music-card">
    <div class="music-card__info">
      <Icon name="lucide:music" size="14" class="music-card__icon" />
      <div class="music-card__text">
        <span class="music-card__title">{{ request.songTitle }}</span>
        <span v-if="request.artist" class="music-card__artist">{{ request.artist }}</span>
      </div>
    </div>
    <button
      v-if="canVote"
      type="button"
      class="music-card__vote"
      @click="emit('upvote', request.id)"
    >
      <Icon name="lucide:heart" size="12" />
      <span>{{ request.votes }}</span>
    </button>
    <span v-else class="music-card__vote-count">
      <Icon name="lucide:heart" size="12" />
      {{ request.votes }}
    </span>
  </div>
</template>

<style scoped>
.music-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.music-card__info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.music-card__icon {
  color: rgba(236, 72, 153, 0.6);
  flex-shrink: 0;
}

.music-card__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.music-card__title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-card__artist {
  font-size: 10px;
  color: var(--color-text-muted);
}

.music-card__vote {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.music-card__vote:hover {
  border-color: rgba(236, 72, 153, 0.3);
  background: rgba(236, 72, 153, 0.05);
  color: #ec4899;
}

.music-card__vote-count {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
