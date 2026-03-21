<script setup>
const { t } = useI18n()
const { getType, getLabel } = useSubEventTypes()

const props = defineProps({
  subEvent: {
    type: Object,
    required: true,
  },
  eventId: {
    type: [Number, String],
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'saved'])

const detail = ref(null)
const loading = ref(true)
const activeTab = ref('overview')
const saving = ref(false)

const typeConfig = computed(() => getType(props.subEvent.type || 'generic'))

// Tabs based on type
const tabs = computed(() => {
  const base = [
    { key: 'overview', label: t('editor.subEventDetail.overview'), icon: 'lucide:info' },
  ]

  switch (props.subEvent.type) {
    case 'ceremony':
      base.push(
        { key: 'content', label: t('editor.subEventDetail.content'), icon: 'lucide:file-text' },
        { key: 'speakers', label: t('editor.subEventDetail.speakers'), icon: 'lucide:users' },
      )
      break
    case 'dinner':
      base.push(
        { key: 'menu', label: t('editor.subEventDetail.menu'), icon: 'lucide:utensils' },
        { key: 'dietary', label: t('editor.subEventDetail.dietary'), icon: 'lucide:heart-pulse' },
      )
      break
    case 'party':
      base.push(
        { key: 'plusOnes', label: t('editor.subEventDetail.plusOnes'), icon: 'lucide:user-plus' },
        { key: 'music', label: t('editor.subEventDetail.musicRequests'), icon: 'lucide:music' },
      )
      break
    case 'activity':
      base.push(
        { key: 'details', label: t('editor.subEventDetail.activityDetails'), icon: 'lucide:settings-2' },
      )
      break
  }

  return base
})

// Local editable state for typeConfig
const editableConfig = ref({})

async function fetchDetail() {
  loading.value = true
  try {
    detail.value = await $fetch(`/api/events/${props.eventId}/sub-events/${props.subEvent.id}/detail`)
    editableConfig.value = detail.value.typeConfig ? JSON.parse(JSON.stringify(detail.value.typeConfig)) : {}
  } catch {
    // fallback to prop data
    detail.value = props.subEvent
    editableConfig.value = props.subEvent.typeConfig || {}
  } finally {
    loading.value = false
  }
}

async function saveTypeConfig() {
  saving.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/sub-events/${props.subEvent.id}/type-config`, {
      method: 'PUT',
      body: editableConfig.value,
    })
    emit('saved')
  } finally {
    saving.value = false
  }
}

// Music requests
const musicRequests = ref([])
const musicFilter = ref('all')
const spotifyStatus = ref(null)
const creatingPlaylist = ref(false)
const addingToPlaylist = ref(false)
const playlistName = ref('')
const selectedPlaylistId = ref(null)

function effectiveStatus(status) {
  return status === 'queued' ? 'approved' : status
}

const filteredMusicRequests = computed(() => {
  if (musicFilter.value === 'all') return musicRequests.value
  return musicRequests.value.filter((r) => effectiveStatus(r.status) === musicFilter.value)
})

const musicCounts = computed(() => {
  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 }
  for (const r of musicRequests.value) {
    counts.all++
    const s = effectiveStatus(r.status)
    if (counts[s] !== undefined) counts[s]++
  }
  return counts
})

async function fetchMusicRequests() {
  musicRequests.value = await $fetch(`/api/events/${props.eventId}/sub-events/${props.subEvent.id}/music-requests`)
}

async function fetchSpotifyStatus() {
  try {
    spotifyStatus.value = await $fetch(`/api/events/${props.eventId}/spotify/status`)
  } catch {
    spotifyStatus.value = { connected: false }
  }
}

async function onApproveMusic(requestId) {
  await $fetch(`/api/events/${props.eventId}/sub-events/${props.subEvent.id}/music-requests/${requestId}/approve`, {
    method: 'POST',
  })
  await fetchMusicRequests()
}

async function onRejectMusic(requestId) {
  await $fetch(`/api/events/${props.eventId}/sub-events/${props.subEvent.id}/music-requests/${requestId}/reject`, {
    method: 'POST',
  })
  await fetchMusicRequests()
}

async function onQueueMusic(requestId) {
  try {
    await $fetch(`/api/events/${props.eventId}/spotify/queue`, {
      method: 'POST',
      body: { requestId },
    })
    await fetchMusicRequests()
  } catch (err) {
    // Error will surface via the 403/404 status
  }
}

const playlistError = ref('')

async function onCreatePlaylist() {
  if (!playlistName.value.trim()) return
  creatingPlaylist.value = true
  playlistError.value = ''
  try {
    await $fetch(`/api/events/${props.eventId}/spotify/playlist`, {
      method: 'POST',
      body: { name: playlistName.value.trim(), subEventId: props.subEvent.id },
    })
    await fetchSpotifyStatus()
    await fetchMusicRequests()
    playlistName.value = ''
  } catch (err) {
    if (err?.statusCode === 403) {
      playlistError.value = 'quota'
    }
  } finally {
    creatingPlaylist.value = false
  }
}

function copyTrackList() {
  const approved = musicRequests.value.filter((r) => r.status === 'approved' && r.spotifyUri)
  const text = approved.map((r) => `${r.songTitle} - ${r.artist || 'Unknown'}`).join('\n')
  navigator.clipboard.writeText(text)
}

function openSpotifySearch(request) {
  const q = encodeURIComponent(`${request.songTitle} ${request.artist || ''}`.trim())
  window.open(`https://open.spotify.com/search/${q}`, '_blank')
}

async function onAddToPlaylist(playlistId, requestId) {
  addingToPlaylist.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/spotify/playlist-add`, {
      method: 'POST',
      body: { playlistId, requestIds: [requestId] },
    })
    await fetchMusicRequests()
  } catch (err) {
    if (err?.statusCode === 403) {
      playlistError.value = 'quota'
    }
  } finally {
    addingToPlaylist.value = false
  }
}

async function onDisconnectSpotify() {
  await $fetch(`/api/events/${props.eventId}/spotify/disconnect`, { method: 'POST' })
  spotifyStatus.value = { connected: false }
}

function connectSpotify() {
  window.location.href = `/api/events/${props.eventId}/spotify/connect`
}

async function onUpvoteMusic(requestId) {
  await $fetch(`/api/events/${props.eventId}/sub-events/${props.subEvent.id}/music-requests/${requestId}/upvote`, {
    method: 'POST',
  })
  await fetchMusicRequests()
}

// Plus ones
const plusOnes = ref([])
async function fetchPlusOnes() {
  plusOnes.value = await $fetch(`/api/events/${props.eventId}/sub-events/${props.subEvent.id}/plus-ones`)
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
}

// Close on escape
function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  fetchDetail()
  if (props.subEvent.type === 'party') {
    fetchMusicRequests()
    fetchPlusOnes()
    fetchSpotifyStatus()
  }
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="panel-overlay" @click.self="emit('close')">
      <div class="panel" :style="{ '--panel-accent': typeConfig.color }">
        <!-- Header -->
        <div class="panel__header">
          <div class="panel__title-row">
            <SubEventTypeIcon :type="subEvent.type || 'generic'" size="md" />
            <div class="panel__title-text">
              <h2 class="panel__title">{{ subEvent.title }}</h2>
              <SubEventTypeBadge :type="subEvent.type || 'generic'" />
            </div>
          </div>
          <button type="button" class="panel__close" @click="emit('close')">
            <Icon name="lucide:x" size="18" />
          </button>
        </div>

        <!-- Tabs -->
        <div class="panel__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="panel__tab"
            :class="{ 'panel__tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <Icon :name="tab.icon" size="14" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Content -->
        <div class="panel__content">
          <div v-if="loading" class="panel__loading">
            <Icon name="lucide:loader-2" size="20" class="panel__spinner" />
          </div>

          <template v-else>
            <!-- Overview tab -->
            <div v-if="activeTab === 'overview'" class="panel__section">
              <p v-if="subEvent.description" class="panel__description">{{ subEvent.description }}</p>

              <div class="panel__meta-grid">
                <div v-if="subEvent.startTime" class="panel__meta-item">
                  <Icon name="lucide:calendar" size="14" />
                  <div>
                    <span class="panel__meta-label">{{ t('editor.subEventDetail.when') }}</span>
                    <span class="panel__meta-value">{{ formatDate(subEvent.startTime) }}, {{ formatTime(subEvent.startTime) }}<template v-if="subEvent.endTime"> — {{ formatTime(subEvent.endTime) }}</template></span>
                  </div>
                </div>
                <div v-if="subEvent.location" class="panel__meta-item">
                  <Icon name="lucide:map-pin" size="14" />
                  <div>
                    <span class="panel__meta-label">{{ t('editor.subEventDetail.where') }}</span>
                    <span class="panel__meta-value">{{ subEvent.location }}</span>
                  </div>
                </div>
                <div v-if="subEvent.dressCode" class="panel__meta-item">
                  <Icon name="lucide:shirt" size="14" />
                  <div>
                    <span class="panel__meta-label">{{ t('editor.dressCode.label') }}</span>
                    <span class="panel__meta-value">{{ subEvent.dressCode }}</span>
                  </div>
                </div>
                <div v-if="subEvent.capacity" class="panel__meta-item">
                  <Icon name="lucide:users" size="14" />
                  <div>
                    <span class="panel__meta-label">{{ t('editor.capacity.label') }}</span>
                    <CapacityIndicator :current="detail?.rsvpCount || 0" :max="subEvent.capacity" />
                  </div>
                </div>
              </div>

              <!-- Stats -->
              <div v-if="detail" class="panel__stats">
                <div v-if="detail.rsvpCount !== undefined" class="panel__stat">
                  <span class="panel__stat-value">{{ detail.rsvpCount }}</span>
                  <span class="panel__stat-label">{{ t('editor.subEventDetail.rsvps') }}</span>
                </div>
                <div v-if="detail.dietaryCount" class="panel__stat">
                  <span class="panel__stat-value">{{ detail.dietaryCount }}</span>
                  <span class="panel__stat-label">{{ t('editor.subEventDetail.dietaryResponses') }}</span>
                </div>
                <div v-if="detail.plusOneCount" class="panel__stat">
                  <span class="panel__stat-value">{{ detail.plusOneCount }}</span>
                  <span class="panel__stat-label">{{ t('editor.subEventDetail.plusOneRequests') }}</span>
                </div>
              </div>
            </div>

            <!-- Ceremony: Content tab -->
            <div v-if="activeTab === 'content'" class="panel__section">
              <div v-if="subEvent.richContent" class="panel__rich-content" v-html="subEvent.richContent" />
              <div v-else class="panel__empty">
                <Icon name="lucide:file-text" size="24" />
                <span>{{ t('editor.ceremony.noContent') }}</span>
              </div>
            </div>

            <!-- Ceremony: Speakers tab -->
            <div v-if="activeTab === 'speakers'" class="panel__section">
              <SpeakerOrderEditor
                v-if="canEdit"
                v-model="editableConfig.speakers"
                @update:model-value="(v) => { editableConfig.speakers = v; saveTypeConfig() }"
              />
              <div v-else-if="editableConfig.speakers?.length" class="panel__speaker-list">
                <div v-for="(speaker, i) in editableConfig.speakers" :key="i" class="panel__speaker">
                  <span class="panel__speaker-order">{{ i + 1 }}</span>
                  <div>
                    <span class="panel__speaker-name">{{ speaker.name }}</span>
                    <span v-if="speaker.role" class="panel__speaker-role">{{ speaker.role }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="panel__empty">
                <Icon name="lucide:users" size="24" />
                <span>{{ t('editor.speakers.none') }}</span>
              </div>
            </div>

            <!-- Dinner: Menu tab -->
            <div v-if="activeTab === 'menu'" class="panel__section">
              <MenuEditor
                v-if="canEdit"
                v-model="editableConfig.menuSections"
                @update:model-value="(v) => { editableConfig.menuSections = v; saveTypeConfig() }"
              />
              <div v-else-if="editableConfig.menuSections?.length" class="panel__menu">
                <div v-for="(section, si) in editableConfig.menuSections" :key="si" class="panel__menu-section">
                  <h4 class="panel__menu-section-title">{{ section.name }}</h4>
                  <div v-for="(item, ii) in section.items" :key="ii" class="panel__menu-item">
                    <span class="panel__menu-item-name">{{ item.name }}</span>
                    <span v-if="item.description" class="panel__menu-item-desc">{{ item.description }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="panel__empty">
                <Icon name="lucide:utensils" size="24" />
                <span>{{ t('editor.menu.none') }}</span>
              </div>
            </div>

            <!-- Dinner: Dietary tab -->
            <div v-if="activeTab === 'dietary'" class="panel__section">
              <template v-if="canEdit && detail?.dietaryResponses">
                <div class="panel__dietary-summary">
                  <div v-for="(response, i) in detail.dietaryResponses" :key="i" class="panel__dietary-row">
                    <span class="panel__dietary-name">{{ response.guestName || response.guestEmail }}</span>
                    <span class="panel__dietary-restrictions">{{ response.restrictions }}</span>
                    <span v-if="response.notes" class="panel__dietary-notes">{{ response.notes }}</span>
                  </div>
                </div>
              </template>
              <div v-else class="panel__empty">
                <Icon name="lucide:heart-pulse" size="24" />
                <span>{{ t('editor.dietary.noResponses') }}</span>
              </div>
            </div>

            <!-- Party: Plus-ones tab -->
            <div v-if="activeTab === 'plusOnes'" class="panel__section">
              <div v-if="plusOnes.length > 0" class="panel__plus-one-list">
                <div v-for="po in plusOnes" :key="po.id" class="panel__plus-one-item">
                  <Icon name="lucide:user-plus" size="14" />
                  <div class="panel__plus-one-info">
                    <span class="panel__plus-one-name">{{ po.plusOneName }}</span>
                    <span class="panel__plus-one-guest">{{ t('editor.plusOne.invitedBy') }} {{ po.guestEmail }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="panel__empty">
                <Icon name="lucide:user-plus" size="24" />
                <span>{{ t('editor.plusOne.none') }}</span>
              </div>
            </div>

            <!-- Party: Music tab -->
            <div v-if="activeTab === 'music'" class="panel__section">
              <!-- Spotify connection -->
              <div class="panel__spotify-bar">
                <template v-if="spotifyStatus?.connected">
                  <div class="panel__spotify-connected">
                    <Icon name="lucide:music-2" size="14" class="panel__spotify-icon" />
                    <span class="panel__spotify-name">{{ spotifyStatus.spotifyDisplayName || 'Spotify' }}</span>
                    <button type="button" class="panel__spotify-disconnect" @click="onDisconnectSpotify">
                      {{ t('editor.spotify.disconnect') }}
                    </button>
                  </div>
                  <div v-if="spotifyStatus.playlistUrl" class="panel__spotify-playlist-link">
                    <a :href="spotifyStatus.playlistUrl" target="_blank" rel="noopener noreferrer" class="panel__spotify-link">
                      <Icon name="lucide:external-link" size="11" />
                      {{ t('editor.spotify.viewPlaylist') }}
                    </a>
                  </div>
                </template>
                <button v-else type="button" class="panel__spotify-connect" @click="connectSpotify">
                  <Icon name="lucide:music-2" size="14" />
                  {{ t('editor.spotify.connect') }}
                </button>
              </div>

              <!-- Playlists -->
              <div v-if="spotifyStatus?.connected" class="panel__playlist-section">
                <!-- Existing playlists -->
                <div v-if="spotifyStatus.playlists?.length > 0" class="panel__playlist-list">
                  <a
                    v-for="pl in spotifyStatus.playlists"
                    :key="pl.id"
                    :href="pl.spotifyPlaylistUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="panel__playlist-item"
                  >
                    <Icon name="lucide:list-music" size="12" />
                    <span>{{ pl.name }}</span>
                    <Icon name="lucide:external-link" size="10" class="panel__playlist-ext" />
                  </a>
                </div>

                <!-- Quota error fallback -->
                <div v-if="playlistError === 'quota'" class="panel__quota-fallback">
                  <p class="panel__quota-msg">
                    <Icon name="lucide:info" size="12" />
                    {{ t('editor.spotify.quotaMessage') }}
                  </p>
                  <AppButton variant="outline" size="sm" @click="copyTrackList">
                    <Icon name="lucide:copy" size="12" />
                    {{ t('editor.spotify.copyTrackList') }}
                  </AppButton>
                </div>

                <!-- Create new playlist -->
                <div v-if="playlistError !== 'quota'" class="panel__create-playlist">
                  <input
                    v-model="playlistName"
                    type="text"
                    class="panel__playlist-input"
                    :placeholder="t('editor.spotify.playlistNamePlaceholder')"
                  />
                  <AppButton
                    variant="outline"
                    size="sm"
                    :disabled="!playlistName.trim() || creatingPlaylist"
                    @click="onCreatePlaylist"
                  >
                    <Icon name="lucide:plus" size="12" />
                    {{ t('editor.spotify.createPlaylist') }}
                  </AppButton>
                </div>
              </div>

              <!-- Filter tabs -->
              <div v-if="musicRequests.length > 0" class="panel__music-filters">
                <button
                  v-for="f in ['all', 'pending', 'approved', 'rejected']"
                  :key="f"
                  type="button"
                  class="panel__music-filter"
                  :class="{ 'panel__music-filter--active': musicFilter === f }"
                  @click="musicFilter = f"
                >
                  {{ t(`editor.musicRequest.filter.${f}`) }}
                  <span class="panel__music-filter-count">{{ musicCounts[f] }}</span>
                </button>
              </div>

              <!-- Request list -->
              <div v-if="filteredMusicRequests.length > 0" class="panel__music-list">
                <MusicRequestCard
                  v-for="request in filteredMusicRequests"
                  :key="request.id"
                  :request="request"
                  :can-vote="false"
                  :show-status="true"
                  :show-actions="canEdit"
                  :spotify-connected="spotifyStatus?.connected || false"
                  :playlists="spotifyStatus?.playlists || []"
                  @approve="onApproveMusic"
                  @reject="onRejectMusic"
                  @queue="onQueueMusic"
                  @upvote="onUpvoteMusic"
                  @add-to-playlist="(reqId, plId) => onAddToPlaylist(plId, reqId)"
                />
              </div>
              <div v-else-if="musicRequests.length === 0" class="panel__empty">
                <Icon name="lucide:music" size="24" />
                <span>{{ t('editor.musicRequest.none') }}</span>
              </div>
              <div v-else class="panel__empty">
                <span>{{ t('editor.musicRequest.noResults') }}</span>
              </div>

              <!-- Refresh -->
              <button type="button" class="panel__refresh-btn" @click="fetchMusicRequests">
                <Icon name="lucide:refresh-cw" size="12" />
                {{ t('editor.musicRequest.refresh') }}
              </button>
            </div>

            <!-- Activity: Details tab -->
            <div v-if="activeTab === 'details'" class="panel__section">
              <div class="panel__meta-grid">
                <div v-if="subEvent.capacity" class="panel__meta-item">
                  <Icon name="lucide:users" size="14" />
                  <div>
                    <span class="panel__meta-label">{{ t('editor.capacity.label') }}</span>
                    <CapacityIndicator :current="detail?.rsvpCount || 0" :max="subEvent.capacity" />
                  </div>
                </div>
                <div v-if="editableConfig.skillLevel" class="panel__meta-item">
                  <Icon name="lucide:signal" size="14" />
                  <div>
                    <span class="panel__meta-label">{{ t('editor.skillLevel.label') }}</span>
                    <span class="panel__meta-value">{{ t(`editor.skillLevel.${editableConfig.skillLevel}`) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="editableConfig.materialsNeeded?.length" class="panel__materials">
                <h4 class="panel__materials-title">{{ t('editor.materials.label') }}</h4>
                <div class="panel__materials-list">
                  <span v-for="(mat, i) in editableConfig.materialsNeeded" :key="i" class="panel__material-tag">
                    {{ mat }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 200ms ease-out;
}

.panel {
  width: 480px;
  max-width: 100vw;
  height: 100%;
  background: var(--color-background);
  border-left: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  animation: slideIn 250ms ease-out;
  overflow: hidden;
}

.panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
}

.panel__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.panel__title-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.panel__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text-primary);
}

.panel__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.panel__close:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.panel__tabs {
  display: flex;
  gap: 0;
  padding: 0 var(--space-5);
  border-bottom: 1px solid var(--color-border-light);
  overflow-x: auto;
}

.panel__tab {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-3);
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.panel__tab:hover {
  color: var(--color-text-primary);
}

.panel__tab--active {
  color: var(--panel-accent);
  border-bottom-color: var(--panel-accent);
}

.panel__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
}

.panel__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.panel__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

.panel__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.panel__description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.panel__meta-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.panel__meta-item {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  color: var(--color-text-muted);
}

.panel__meta-item > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel__meta-label {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.panel__meta-value {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.panel__stats {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.panel__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.panel__stat-value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--panel-accent);
}

.panel__stat-label {
  font-size: 10px;
  color: var(--color-text-muted);
}

.panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  opacity: 0.5;
}

.panel__rich-content {
  font-size: var(--text-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}

.panel__speaker-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.panel__speaker {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.panel__speaker-order {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.panel__speaker-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.panel__speaker-role {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  display: block;
}

.panel__menu-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.panel__menu-section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  padding-bottom: var(--space-1);
  border-bottom: 1px solid var(--color-border-light);
}

.panel__menu-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-left: var(--space-3);
}

.panel__menu-item-name {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.panel__menu-item-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.panel__dietary-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.panel__dietary-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.panel__dietary-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.panel__dietary-restrictions {
  font-size: var(--text-xs);
  color: #f59e0b;
}

.panel__dietary-notes {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.panel__plus-one-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.panel__plus-one-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}

.panel__plus-one-info {
  display: flex;
  flex-direction: column;
}

.panel__plus-one-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.panel__plus-one-guest {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.panel__spotify-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.panel__spotify-connected {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.panel__spotify-icon {
  color: #1db954;
}

.panel__spotify-name {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  flex: 1;
}

.panel__spotify-disconnect {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: 10px;
  cursor: pointer;
  text-decoration: underline;
}

.panel__spotify-disconnect:hover {
  color: #ef4444;
}

.panel__spotify-playlist-link {
  padding-top: var(--space-1);
}

.panel__spotify-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 10px;
  color: #1db954;
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.panel__spotify-link:hover {
  text-decoration: underline;
}

.panel__spotify-connect {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid rgba(29, 185, 84, 0.3);
  border-radius: var(--radius-md);
  background: rgba(29, 185, 84, 0.08);
  color: #1db954;
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.panel__spotify-connect:hover {
  background: rgba(29, 185, 84, 0.15);
  border-color: rgba(29, 185, 84, 0.5);
}

.panel__playlist-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.panel__playlist-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.panel__playlist-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background var(--transition-fast);
}

.panel__playlist-item:hover {
  background: var(--color-border-light);
}

.panel__playlist-item span {
  flex: 1;
}

.panel__playlist-ext {
  color: var(--color-text-muted);
}

.panel__quota-fallback {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.panel__quota-msg {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
  padding: var(--space-2) var(--space-3);
  background: rgba(245, 158, 11, 0.08);
  border-radius: var(--radius-md);
  line-height: var(--line-height-relaxed);
}

.panel__quota-actions {
  display: flex;
  gap: var(--space-2);
}

.panel__playlist-actions {
  display: flex;
  gap: var(--space-2);
}

.panel__create-playlist {
  display: flex;
  gap: var(--space-2);
  flex: 1;
}

.panel__playlist-input {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  outline: none;
}

.panel__playlist-input:focus {
  border-color: var(--panel-accent);
}

.panel__music-filters {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.panel__music-filter {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2);
  border: none;
  border-right: 1px solid var(--color-border-light);
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.panel__music-filter:last-child {
  border-right: none;
}

.panel__music-filter:hover {
  background: var(--color-surface);
}

.panel__music-filter--active {
  background: var(--color-surface);
  color: var(--panel-accent);
}

.panel__music-filter-count {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: var(--radius-full);
  background: var(--color-border-light);
  color: var(--color-text-muted);
}

.panel__music-filter--active .panel__music-filter-count {
  background: color-mix(in srgb, var(--panel-accent) 15%, transparent);
  color: var(--panel-accent);
}

.panel__refresh-btn {
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

.panel__refresh-btn:hover {
  color: var(--panel-accent);
}

.panel__music-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.panel__materials {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.panel__materials-title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.panel__materials-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.panel__material-tag {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  background: rgba(20, 184, 166, 0.08);
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: #14b8a6;
  font-size: var(--text-xs);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .panel {
    width: 100vw;
  }
}
</style>
