<script setup>
const { t, locale } = useI18n()

const props = defineProps({
  option: { type: Object, required: true },
  mode: { type: String, default: 'results' }, // 'vote' | 'results' | 'edit'
  currentVote: { type: String, default: null }, // 'yes' | 'maybe' | 'no'
  totalVoters: { type: Number, default: 0 },
  isWinner: { type: Boolean, default: false },
})

const emit = defineEmits(['vote', 'remove'])

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(locale.value === 'nl' ? 'nl-NL' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleTimeString(locale.value === 'nl' ? 'nl-NL' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div
    class="date-poll-option"
    :class="{
      'date-poll-option--winner': isWinner,
      [`date-poll-option--voted-${currentVote}`]: mode === 'vote' && currentVote,
    }"
  >
    <!-- Date info -->
    <div class="date-poll-option__date">
      <Icon v-if="isWinner" name="lucide:crown" size="14" class="date-poll-option__crown" />
      <span class="date-poll-option__label">{{ formatDate(option.date) }}</span>
      <span v-if="option.startTime" class="date-poll-option__time">
        {{ formatTime(option.startTime) }}
        <template v-if="option.endTime"> – {{ formatTime(option.endTime) }}</template>
      </span>
    </div>

    <!-- Vote buttons (voting mode) -->
    <div v-if="mode === 'vote'" class="date-poll-option__votes">
      <button
        class="vote-btn vote-btn--yes"
        :class="{ 'vote-btn--active': currentVote === 'yes' }"
        @click="emit('vote', { optionId: option.id, status: 'yes' })"
        :title="t('editor.datePoll.yes')"
      >
        <Icon name="lucide:check" size="14" />
      </button>
      <button
        class="vote-btn vote-btn--maybe"
        :class="{ 'vote-btn--active': currentVote === 'maybe' }"
        @click="emit('vote', { optionId: option.id, status: 'maybe' })"
        :title="t('editor.datePoll.maybe')"
      >
        <Icon name="lucide:minus" size="14" />
      </button>
      <button
        class="vote-btn vote-btn--no"
        :class="{ 'vote-btn--active': currentVote === 'no' }"
        @click="emit('vote', { optionId: option.id, status: 'no' })"
        :title="t('editor.datePoll.no')"
      >
        <Icon name="lucide:x" size="14" />
      </button>
    </div>

    <!-- Results bar (results mode) -->
    <DatePollResultBar
      v-if="mode === 'results'"
      :yes-count="option.yesCount"
      :maybe-count="option.maybeCount"
      :no-count="option.noCount"
      :total="totalVoters"
      :is-winner="isWinner"
    />

    <!-- Remove button (edit mode) -->
    <button
      v-if="mode === 'edit'"
      class="date-poll-option__remove"
      @click="emit('remove', option.id)"
      :title="t('editor.datePoll.removeOption')"
    >
      <Icon name="lucide:trash-2" size="14" />
    </button>
  </div>
</template>

<style scoped>
.date-poll-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.date-poll-option--winner {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 5%, transparent);
}

.date-poll-option__date {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.date-poll-option__crown {
  color: var(--color-accent);
  flex-shrink: 0;
}

.date-poll-option__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-poll-option__time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* Vote buttons */
.date-poll-option__votes {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.vote-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1.5px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.vote-btn:hover { border-color: var(--color-border); }

.vote-btn--yes.vote-btn--active {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.vote-btn--maybe.vote-btn--active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

.vote-btn--no.vote-btn--active {
  background: var(--color-text-muted);
  border-color: var(--color-text-muted);
  color: white;
}

.vote-btn--yes:hover { border-color: #22c55e; color: #22c55e; }
.vote-btn--maybe:hover { border-color: #f59e0b; color: #f59e0b; }
.vote-btn--no:hover { border-color: var(--color-border); color: var(--color-text-secondary); }

/* Remove button */
.date-poll-option__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.date-poll-option__remove:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}
</style>
