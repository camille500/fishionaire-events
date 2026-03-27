<script setup>
const { t } = useI18n()

const props = defineProps({
  playlist: {
    type: Object,
    required: true,
  },
  tracks: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle', 'remove'])

const formattedDuration = computed(() => {
  const ms = props.playlist.totalDurationMs || 0
  return Math.round(ms / 60000)
})
</script>

<template>
  <div class="playlist-accordion" :class="{ 'playlist-accordion--expanded': expanded }">
    <button type="button" class="playlist-accordion__header" @click="emit('toggle')">
      <Icon :name="expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'" size="14" class="playlist-accordion__chevron" />
      <Icon name="lucide:list-music" size="14" class="playlist-accordion__icon" />
      <span class="playlist-accordion__name">{{ playlist.name }}</span>
      <span class="playlist-accordion__meta">
        <span class="playlist-accordion__count">{{ playlist.trackCount || 0 }}</span>
        <span v-if="formattedDuration > 0" class="playlist-accordion__duration">{{ formattedDuration }} min</span>
      </span>
      <a
        :href="playlist.spotifyPlaylistUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="playlist-accordion__ext"
        @click.stop
      >
        <Icon name="lucide:external-link" size="11" />
      </a>
    </button>

    <div v-if="expanded" class="playlist-accordion__body">
      <div v-if="loading" class="playlist-accordion__loading">
        <Icon name="lucide:loader-2" size="14" class="playlist-accordion__spinner" />
      </div>

      <template v-else-if="tracks.length > 0">
        <div v-for="track in tracks" :key="track.id" class="playlist-accordion__track">
          <img
            v-if="track.albumArtUrl"
            :src="track.albumArtUrl"
            :alt="track.songTitle"
            class="playlist-accordion__art"
            loading="lazy"
          />
          <div v-else class="playlist-accordion__art-placeholder">
            <Icon name="lucide:music" size="10" />
          </div>
          <div class="playlist-accordion__track-info">
            <span class="playlist-accordion__track-title">{{ track.songTitle }}</span>
            <span v-if="track.artist" class="playlist-accordion__track-artist">{{ track.artist }}</span>
          </div>
          <button
            type="button"
            class="playlist-accordion__remove"
            :title="t('editor.spotify.removeFromPlaylist')"
            @click="emit('remove', track.id)"
          >
            <Icon name="lucide:x" size="10" />
          </button>
        </div>
      </template>

      <div v-else class="playlist-accordion__empty">
        <span>{{ t('editor.spotify.noTracksInPlaylist') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-accordion {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
}

.playlist-accordion--expanded {
  border-color: rgba(29, 185, 84, 0.3);
}

.playlist-accordion__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: none;
  font-family: var(--font-family);
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.playlist-accordion__header:hover {
  background: var(--color-border-light);
}

.playlist-accordion__chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.playlist-accordion__icon {
  color: #1db954;
  flex-shrink: 0;
}

.playlist-accordion__name {
  flex: 1;
  font-weight: var(--font-weight-medium);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-accordion__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.playlist-accordion__count {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: var(--radius-full);
  background: rgba(29, 185, 84, 0.1);
  color: #1db954;
  font-weight: var(--font-weight-semibold);
}

.playlist-accordion__duration {
  font-size: 9px;
  color: var(--color-text-muted);
}

.playlist-accordion__ext {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.playlist-accordion__ext:hover {
  color: #1db954;
}

.playlist-accordion__body {
  border-top: 1px solid var(--color-border-light);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-height: 280px;
  overflow-y: auto;
}

.playlist-accordion__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-3);
}

.playlist-accordion__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

.playlist-accordion__track {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.playlist-accordion__track:hover {
  background: var(--color-border-light);
}

.playlist-accordion__art {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.playlist-accordion__art-placeholder {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(236, 72, 153, 0.6);
  flex-shrink: 0;
}

.playlist-accordion__track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.playlist-accordion__track-title {
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-accordion__track-artist {
  font-size: 9px;
  color: var(--color-text-muted);
}

.playlist-accordion__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0;
  transition: all var(--transition-fast);
}

.playlist-accordion__track:hover .playlist-accordion__remove {
  opacity: 1;
}

.playlist-accordion__remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.playlist-accordion__empty {
  display: flex;
  justify-content: center;
  padding: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  opacity: 0.6;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
