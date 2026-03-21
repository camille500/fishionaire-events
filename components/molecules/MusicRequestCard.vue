<script setup>
const { t } = useI18n()

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  canVote: {
    type: Boolean,
    default: true,
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  spotifyConnected: {
    type: Boolean,
    default: false,
  },
  playlists: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['upvote', 'approve', 'reject', 'queue', 'addToPlaylist'])

const isPlaying = ref(false)
const audioRef = ref(null)

function togglePreview() {
  if (!props.request.previewUrl) return
  if (!audioRef.value) {
    audioRef.value = new Audio(props.request.previewUrl)
    audioRef.value.addEventListener('ended', () => { isPlaying.value = false })
  }
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play()
    isPlaying.value = true
  }
}

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value = null
  }
})

const displayStatus = computed(() => {
  // Treat 'queued' as 'approved' — queuing is a transient playback action, not a status
  return props.request.status === 'queued' ? 'approved' : props.request.status
})

const statusColor = computed(() => {
  switch (displayStatus.value) {
    case 'approved': return '#22c55e'
    case 'rejected': return '#ef4444'
    default: return '#f59e0b'
  }
})
</script>

<template>
  <div class="music-card" :class="{ 'music-card--rejected': request.status === 'rejected' }">
    <!-- Album art -->
    <button
      v-if="request.albumArtUrl"
      type="button"
      class="music-card__art-btn"
      :class="{ 'music-card__art-btn--playable': request.previewUrl }"
      @click="togglePreview"
    >
      <img :src="request.albumArtUrl" :alt="request.songTitle" class="music-card__art" loading="lazy" />
      <div v-if="request.previewUrl" class="music-card__play-overlay">
        <Icon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" size="12" />
      </div>
    </button>
    <div v-else class="music-card__art-placeholder">
      <Icon name="lucide:music" size="14" />
    </div>

    <!-- Info -->
    <div class="music-card__info">
      <div class="music-card__text">
        <span class="music-card__title">{{ request.songTitle }}</span>
        <span v-if="request.artist" class="music-card__artist">{{ request.artist }}</span>
      </div>
    </div>

    <!-- Status badge -->
    <span v-if="showStatus && request.status" class="music-card__status" :style="{ '--status-color': statusColor }">
      {{ t(`editor.musicRequest.${displayStatus}`) }}
    </span>

    <!-- Actions for organizer -->
    <div v-if="showActions" class="music-card__actions">
      <template v-if="request.status === 'pending'">
        <button type="button" class="music-card__action music-card__action--approve" @click="emit('approve', request.id)">
          <Icon name="lucide:check" size="12" />
        </button>
        <button type="button" class="music-card__action music-card__action--reject" @click="emit('reject', request.id)">
          <Icon name="lucide:x" size="12" />
        </button>
      </template>
      <template v-if="(request.status === 'approved' || request.status === 'queued') && spotifyConnected && request.spotifyUri">
        <select
          v-if="playlists.length > 1 && !request.playlistId"
          class="music-card__playlist-select"
          @change="(e) => { if (e.target.value) emit('addToPlaylist', request.id, Number(e.target.value)); e.target.value = '' }"
        >
          <option value="">{{ t('editor.spotify.addToPlaylist') }}</option>
          <option v-for="pl in playlists" :key="pl.id" :value="pl.id">{{ pl.name }}</option>
        </select>
        <button
          v-else-if="playlists.length === 1 && !request.playlistId"
          type="button"
          class="music-card__action music-card__action--add"
          :title="playlists[0].name"
          @click="emit('addToPlaylist', request.id, playlists[0].id)"
        >
          <Icon name="lucide:list-plus" size="12" />
        </button>
        <span v-else-if="request.playlistId" class="music-card__in-playlist">
          <Icon name="lucide:check" size="10" />
        </span>
        <button
          type="button"
          class="music-card__action music-card__action--queue"
          :title="t('editor.spotify.addToQueue')"
          @click="emit('queue', request.id)"
        >
          <Icon name="lucide:play" size="12" />
        </button>
      </template>
    </div>

    <!-- Vote button for guests -->
    <button
      v-if="canVote && !showActions"
      type="button"
      class="music-card__vote"
      @click="emit('upvote', request.id)"
    >
      <Icon name="lucide:heart" size="12" />
      <span>{{ request.votes }}</span>
    </button>
    <span v-else-if="!showActions" class="music-card__vote-count">
      <Icon name="lucide:heart" size="12" />
      {{ request.votes }}
    </span>
  </div>
</template>

<style scoped>
.music-card {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: opacity var(--transition-fast);
}

.music-card--rejected {
  opacity: 0.5;
}

.music-card__art-btn {
  position: relative;
  border: none;
  background: none;
  padding: 0;
  cursor: default;
  flex-shrink: 0;
}

.music-card__art-btn--playable {
  cursor: pointer;
}

.music-card__art {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.music-card__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-sm);
  color: white;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.music-card__art-btn--playable:hover .music-card__play-overlay {
  opacity: 1;
}

.music-card__art-placeholder {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(236, 72, 153, 0.6);
  flex-shrink: 0;
}

.music-card__info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  flex: 1;
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

.music-card__status {
  font-size: 9px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--status-color) 12%, transparent);
  color: var(--status-color);
  flex-shrink: 0;
}

.music-card__actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.music-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
}

.music-card__action--approve {
  color: #22c55e;
}

.music-card__action--approve:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.music-card__action--reject {
  color: #ef4444;
}

.music-card__action--reject:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.music-card__action--queue {
  color: #8b5cf6;
}

.music-card__action--queue:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
}

.music-card__action--add {
  color: #1db954;
}

.music-card__action--add:hover {
  background: rgba(29, 185, 84, 0.1);
  border-color: rgba(29, 185, 84, 0.3);
}

.music-card__playlist-select {
  padding: 2px var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font-family);
  font-size: 10px;
  color: var(--color-text-muted);
  cursor: pointer;
  max-width: 120px;
}

.music-card__in-playlist {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  flex-shrink: 0;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
}
</style>
