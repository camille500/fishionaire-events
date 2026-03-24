<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: { type: Number, required: true },
  token: { type: String, default: '' },
  initialEmail: { type: String, default: '' },
  initialName: { type: String, default: '' },
})

const emit = defineEmits(['voted'])

const {
  poll,
  loading,
  error,
  savingVoteId,
  votes,
  hasVoted,
  fetchPoll,
  setVote,
} = useDatePollVoting(
  computed(() => props.eventId),
  computed(() => props.token),
  computed(() => props.initialEmail),
  computed(() => props.initialName),
)

watch(hasVoted, (v) => {
  if (v) emit('voted')
}, { immediate: true })

onMounted(fetchPoll)
</script>

<template>
  <div class="poll-step">
    <!-- Loading -->
    <div v-if="loading" class="poll-step__loading">
      <SkeletonLoader height="48px" />
      <SkeletonLoader height="48px" />
    </div>

    <!-- Error -->
    <div v-else-if="error && !poll" class="poll-step__message">
      <Icon name="lucide:alert-circle" size="18" />
      <span>{{ error }}</span>
    </div>

    <!-- Poll closed or missing -->
    <div v-else-if="!poll || !poll.isActive" class="poll-step__message">
      <Icon name="lucide:calendar-off" size="18" />
      <span>{{ t('editor.datePoll.guestVoting.pollClosed') }}</span>
    </div>

    <!-- Voting UI -->
    <template v-else>
      <div class="poll-step__options">
        <DatePollOptionRow
          v-for="opt in poll.options"
          :key="opt.id"
          :option="opt"
          mode="vote"
          :current-vote="votes[opt.id] || null"
          @vote="({ optionId, status }) => setVote(optionId, status)"
        />
      </div>

      <div class="poll-step__legend">
        <span class="poll-step__legend-item poll-step__legend-item--yes">
          <Icon name="lucide:check" size="12" />{{ t('editor.datePoll.yes') }}
        </span>
        <span class="poll-step__legend-item poll-step__legend-item--maybe">
          <Icon name="lucide:minus" size="12" />{{ t('editor.datePoll.maybe') }}
        </span>
        <span class="poll-step__legend-item poll-step__legend-item--no">
          <Icon name="lucide:x" size="12" />{{ t('editor.datePoll.no') }}
        </span>
      </div>

      <!-- Auto-save indicator -->
      <Transition name="fade">
        <div v-if="savingVoteId" class="poll-step__saving">
          <span class="poll-step__spinner" />
          {{ t('editor.datePoll.guestVoting.saving') }}
        </div>
      </Transition>

      <!-- Saved confirmation -->
      <Transition name="fade">
        <div v-if="hasVoted && !savingVoteId" class="poll-step__saved">
          <Icon name="lucide:check-circle" size="14" />
          {{ t('invite.rsvp.votesSaved') }}
        </div>
      </Transition>

      <div v-if="error" class="poll-step__error">
        <Icon name="lucide:alert-circle" size="14" />
        {{ error }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.poll-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.poll-step__loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.poll-step__message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.poll-step__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.poll-step__legend {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.poll-step__legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.poll-step__legend-item--yes { color: #22c55e; }
.poll-step__legend-item--maybe { color: #f59e0b; }

.poll-step__saving {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.poll-step__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border);
  border-top-color: var(--event-accent, var(--color-accent));
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.poll-step__saved {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.poll-step__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-error);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
