<script setup>
const { t } = useI18n()

const props = defineProps({
  token: { type: String, required: true },
})

const emit = defineEmits(['select'])

const query = ref('')
const results = ref([])
const loading = ref(false)
const showResults = ref(false)
const manualMode = ref(false)
const manualForm = reactive({ songTitle: '', artist: '' })

let debounceTimer = null

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!query.value || query.value.trim().length < 2) {
    results.value = []
    showResults.value = false
    return
  }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      results.value = await $fetch(`/api/invite/${props.token}/spotify-search`, {
        query: { q: query.value.trim() },
      })
      showResults.value = true
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}

function selectTrack(track) {
  emit('select', track)
  query.value = ''
  results.value = []
  showResults.value = false
}

function submitManual() {
  if (!manualForm.songTitle.trim()) return
  emit('select', {
    songTitle: manualForm.songTitle.trim(),
    artist: manualForm.artist.trim() || null,
    spotifyTrackId: null,
    spotifyUri: null,
    albumArtUrl: null,
    previewUrl: null,
    durationMs: null,
  })
  manualForm.songTitle = ''
  manualForm.artist = ''
}

function formatDuration(ms) {
  if (!ms) return ''
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function onBlur() {
  setTimeout(() => { showResults.value = false }, 200)
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="spotify-search">
    <template v-if="!manualMode">
      <div class="spotify-search__input-wrap">
        <Icon name="lucide:search" size="14" class="spotify-search__search-icon" />
        <input
          v-model="query"
          type="text"
          class="spotify-search__input"
          :placeholder="t('invite.programme.spotifySearchPlaceholder')"
          @input="onInput"
          @focus="showResults = results.length > 0"
          @blur="onBlur"
        />
        <Icon v-if="loading" name="lucide:loader-2" size="14" class="spotify-search__loader" />
      </div>

      <div v-if="showResults && results.length > 0" class="spotify-search__results">
        <button
          v-for="track in results"
          :key="track.spotifyTrackId"
          type="button"
          class="spotify-search__result"
          @mousedown.prevent="selectTrack(track)"
        >
          <img
            v-if="track.albumArtUrl"
            :src="track.albumArtUrl"
            :alt="track.songTitle"
            class="spotify-search__art"
            loading="lazy"
          />
          <div v-else class="spotify-search__art-placeholder">
            <Icon name="lucide:music" size="14" />
          </div>
          <div class="spotify-search__track-info">
            <span class="spotify-search__track-title">{{ track.songTitle }}</span>
            <span class="spotify-search__track-artist">{{ track.artist }}</span>
          </div>
          <span v-if="track.durationMs" class="spotify-search__duration">
            {{ formatDuration(track.durationMs) }}
          </span>
        </button>
      </div>

      <button type="button" class="spotify-search__toggle" @click="manualMode = true">
        <Icon name="lucide:pencil" size="11" />
        {{ t('invite.programme.manualEntry') }}
      </button>
    </template>

    <template v-else>
      <div class="spotify-search__manual-form">
        <input
          v-model="manualForm.songTitle"
          type="text"
          class="spotify-search__input"
          :placeholder="t('invite.programme.songPlaceholder')"
        />
        <input
          v-model="manualForm.artist"
          type="text"
          class="spotify-search__input"
          :placeholder="t('invite.programme.artistPlaceholder')"
        />
        <AppButton
          variant="outline"
          size="sm"
          :disabled="!manualForm.songTitle.trim()"
          @click="submitManual"
        >
          <Icon name="lucide:plus" size="12" />
          {{ t('invite.programme.addSong') }}
        </AppButton>
      </div>
      <button type="button" class="spotify-search__toggle" @click="manualMode = false">
        <Icon name="lucide:search" size="11" />
        {{ t('invite.programme.spotifySearch') }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.spotify-search {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  position: relative;
}

.spotify-search__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.spotify-search__search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.spotify-search__input {
  flex: 1;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.spotify-search__input:focus {
  border-color: var(--event-accent, var(--color-accent));
}

.spotify-search__input::placeholder {
  color: var(--color-text-muted);
}

.spotify-search__loader {
  position: absolute;
  right: var(--space-3);
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

.spotify-search__results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  max-height: 280px;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  margin-top: var(--space-1);
}

.spotify-search__result {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-family);
  transition: background var(--transition-fast);
}

.spotify-search__result:hover {
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 8%, transparent);
}

.spotify-search__art {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.spotify-search__art-placeholder {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.spotify-search__track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.spotify-search__track-title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-search__track-artist {
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-search__duration {
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.spotify-search__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: 10px;
  cursor: pointer;
  align-self: flex-start;
  transition: color var(--transition-fast);
}

.spotify-search__toggle:hover {
  color: var(--event-accent, var(--color-accent));
}

.spotify-search__manual-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.spotify-search__manual-form .spotify-search__input {
  padding-left: var(--space-3);
  flex: 1;
  min-width: 120px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .spotify-search__manual-form {
    flex-direction: column;
  }

  .spotify-search__manual-form .spotify-search__input {
    min-width: 0;
    width: 100%;
  }
}
</style>
