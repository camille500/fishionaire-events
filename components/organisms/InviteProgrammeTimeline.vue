<script setup>
const { t, locale } = useI18n()

const timeLocale = computed(() => locale.value === 'nl' ? 'nl-NL' : 'en-GB')

defineProps({
  subEvents: { type: Array, required: true },
  invitation: { type: Object, default: null },
  eventData: { type: Object, required: true },
  token: { type: String, default: '' },
  musicLists: { type: Object, default: () => ({}) },
  dietarySaving: { type: Object, default: () => ({}) },
  musicSubmitting: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submitDietary', 'submitMusic', 'upvoteMusic'])

const MUSIC_INITIAL_LIMIT = 5
const expandedMusicLists = reactive({})

function visibleMusicRequests(subEventId) {
  const list = props.musicLists[subEventId] || []
  if (expandedMusicLists[subEventId]) return list
  return list.slice(0, MUSIC_INITIAL_LIMIT)
}

function toggleMusicList(subEventId) {
  expandedMusicLists[subEventId] = !expandedMusicLists[subEventId]
}
</script>

<template>
  <div class="invite-timeline">
    <div
      v-for="(se, idx) in subEvents"
      :key="se.id"
      class="invite-timeline__item"
      :style="{ animationDelay: (100 + idx * 120) + 'ms' }"
    >
      <!-- Track: dot + connecting line -->
      <div class="invite-timeline__track">
        <div class="invite-timeline__dot">
          <SubEventTypeIcon :type="se.type || 'generic'" size="sm" />
        </div>
        <div v-if="idx < subEvents.length - 1" class="invite-timeline__line" />
      </div>

      <!-- Content card -->
      <div class="invite-timeline__content">
        <div class="invite-timeline__header">
          <h4 class="invite-timeline__name">{{ se.title }}</h4>
          <div v-if="se.startTime" class="invite-timeline__time">
            <Icon name="lucide:clock" size="12" />
            {{ new Date(se.startTime).toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </div>

        <p v-if="se.description" class="invite-timeline__desc">{{ se.description }}</p>

        <!-- Location -->
        <div v-if="se.location" class="invite-timeline__meta">
          <Icon name="lucide:map-pin" size="12" />
          <a
            v-if="se.locationLat && se.locationLon"
            :href="`https://www.google.com/maps/search/?api=1&query=${se.locationLat},${se.locationLon}`"
            target="_blank"
            rel="noopener noreferrer"
            class="invite-timeline__location-link"
          >{{ se.location }}</a>
          <template v-else>{{ se.location }}</template>
        </div>

        <!-- Dress code -->
        <div v-if="se.dressCode" class="invite-timeline__meta">
          <Icon name="lucide:shirt" size="12" />
          {{ t('invite.programme.dressCodeNote', { dressCode: se.dressCode }) }}
        </div>

        <!-- Capacity -->
        <div v-if="se.type === 'activity' && se.capacity" class="invite-timeline__meta">
          <Icon name="lucide:users" size="12" />
          {{ t('editor.subEventPreview.capacity', { count: se.capacity }) }}
        </div>

        <!-- Dietary preferences (any sub-event with dietaryEnabled) -->
        <div v-if="se.typeConfig?.dietaryEnabled" class="invite-timeline__interaction">
          <p class="invite-timeline__hint">
            <Icon name="lucide:heart-pulse" size="13" />
            {{ t('invite.programme.dietaryHint') }}
          </p>
          <DietaryPreferenceForm
            :loading="dietarySaving[se.id]"
            @submit="(data) => $emit('submitDietary', se.id, data)"
          />
        </div>

        <!-- Music requests (any sub-event with musicRequestsEnabled) -->
        <div v-if="se.typeConfig?.musicRequestsEnabled" class="invite-timeline__interaction">
          <p class="invite-timeline__hint">
            <Icon name="lucide:music" size="13" />
            {{ t('invite.programme.musicHint') }}
          </p>
          <SpotifyTrackSearch
            :token="token"
            @select="(track) => $emit('submitMusic', se.id, track)"
          />
          <div v-if="musicLists[se.id]?.length > 0" class="invite-timeline__music-list">
            <MusicRequestCard
              v-for="req in visibleMusicRequests(se.id)"
              :key="req.id"
              :request="req"
              @upvote="(id) => $emit('upvoteMusic', se.id, id)"
            />
            <button
              v-if="musicLists[se.id].length > MUSIC_INITIAL_LIMIT"
              type="button"
              class="invite-timeline__show-more"
              @click="toggleMusicList(se.id)"
            >
              {{ expandedMusicLists[se.id]
                ? t('invite.programme.showLessMusic')
                : t('invite.programme.showAllMusic', { count: musicLists[se.id].length })
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invite-timeline {
  display: flex;
  flex-direction: column;
}

.invite-timeline__item {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: var(--space-4);
  animation: timelineItemReveal 500ms ease-out both;
}

@keyframes timelineItemReveal {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Track */
.invite-timeline__track {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.invite-timeline__dot {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.invite-timeline__line {
  width: 2px;
  flex: 1;
  min-height: 24px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--event-accent, var(--color-accent)) 40%, transparent),
    color-mix(in srgb, var(--event-accent, var(--color-accent)) 10%, transparent)
  );
  border-radius: 1px;
  margin: var(--space-2) 0;
}

/* Content card */
.invite-timeline__content {
  padding: var(--space-5);
  margin-bottom: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  transition: box-shadow var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.invite-timeline__content:hover {
  box-shadow: var(--shadow-sm);
}

/* Header */
.invite-timeline__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.invite-timeline__name {
  font-family: var(--font-family-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.invite-timeline__time {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--event-accent, var(--color-accent));
  white-space: nowrap;
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 8%, transparent);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.invite-timeline__desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.invite-timeline__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.invite-timeline__location-link {
  color: var(--event-accent, var(--color-accent));
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.invite-timeline__location-link:hover {
  text-decoration: underline;
}

/* Interaction sections */
.invite-timeline__interaction {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.invite-timeline__hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin: 0;
}

.invite-timeline__music-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.invite-timeline__show-more {
  border: none;
  background: none;
  color: var(--event-accent, var(--color-accent));
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--space-2) 0;
  text-align: center;
  transition: opacity var(--transition-fast);
}

.invite-timeline__show-more:hover {
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 640px) {
  .invite-timeline__item {
    grid-template-columns: 40px 1fr;
    gap: var(--space-3);
  }

  .invite-timeline__content {
    padding: var(--space-4);
  }

  .invite-timeline__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }
}
</style>
