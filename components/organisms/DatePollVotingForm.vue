<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: { type: Number, required: true },
  initialEmail: { type: String, default: '' },
  initialName: { type: String, default: '' },
  token: { type: String, default: '' },
  eventTitle: { type: String, default: '' },
})

const {
  poll,
  loading,
  submitting,
  submitted,
  error,
  savingVoteId,
  email,
  name,
  votes,
  isIdentified,
  fetchPoll,
  setVote,
  submit,
} = useDatePollVoting(
  computed(() => props.eventId),
  computed(() => props.token),
  computed(() => props.initialEmail),
  computed(() => props.initialName),
)

onMounted(fetchPoll)
</script>

<template>
  <div class="voting-form">
    <!-- Loading -->
    <div v-if="loading" class="voting-form__loading">
      <SkeletonLoader height="64px" />
      <SkeletonLoader height="64px" />
      <SkeletonLoader height="64px" />
    </div>

    <!-- Error -->
    <div v-else-if="error && !poll" class="voting-form__error">
      <Icon name="lucide:alert-circle" size="24" />
      <AppText>{{ error }}</AppText>
    </div>

    <!-- No poll / closed -->
    <div v-else-if="!poll || !poll.isActive" class="voting-form__closed">
      <Icon name="lucide:calendar-off" size="32" />
      <AppText muted>{{ t('editor.datePoll.guestVoting.pollClosed') }}</AppText>
    </div>

    <!-- Submitted state -->
    <div v-else-if="submitted" class="voting-form__thanks">
      <div class="voting-form__thanks-icon">
        <Icon name="lucide:check-circle-2" size="40" />
      </div>
      <AppHeading :level="3" size="sm">{{ t('editor.datePoll.guestVoting.thankYou') }}</AppHeading>
      <AppText muted>{{ t('editor.datePoll.guestVoting.thankYouDesc') }}</AppText>
    </div>

    <!-- Voting form -->
    <template v-else>
      <div class="voting-form__options">
        <DatePollOptionRow
          v-for="opt in poll.options"
          :key="opt.id"
          :option="opt"
          mode="vote"
          :current-vote="votes[opt.id] || null"
          @vote="({ optionId, status }) => setVote(optionId, status)"
        />
      </div>

      <div class="voting-form__legend">
        <span class="voting-form__legend-item voting-form__legend-item--yes">
          <Icon name="lucide:check" size="12" />{{ t('editor.datePoll.yes') }}
        </span>
        <span class="voting-form__legend-item voting-form__legend-item--maybe">
          <Icon name="lucide:minus" size="12" />{{ t('editor.datePoll.maybe') }}
        </span>
        <span class="voting-form__legend-item voting-form__legend-item--no">
          <Icon name="lucide:x" size="12" />{{ t('editor.datePoll.no') }}
        </span>
      </div>

      <!-- Auto-save indicator when identified via invite token -->
      <Transition name="fade">
        <div v-if="isIdentified && savingVoteId" class="voting-form__auto-save">
          <span class="voting-form__auto-save-spinner" />
          {{ t('editor.datePoll.guestVoting.saving') }}
        </div>
      </Transition>

      <!-- Identity form only shown when guest is NOT already identified (e.g. public poll page) -->
      <template v-if="!isIdentified">
        <div class="voting-form__identity">
          <div class="voting-form__field">
            <label class="voting-form__label">{{ t('editor.datePoll.guestVoting.nameLabel') }}</label>
            <input
              v-model="name"
              type="text"
              class="voting-form__input"
              :placeholder="t('editor.datePoll.guestVoting.namePlaceholder')"
            />
          </div>
          <div class="voting-form__field">
            <label class="voting-form__label">{{ t('editor.datePoll.guestVoting.emailLabel') }} *</label>
            <input
              v-model="email"
              type="email"
              class="voting-form__input"
              :placeholder="t('editor.datePoll.guestVoting.emailPlaceholder')"
              required
            />
          </div>
        </div>

        <AppButton
          variant="primary"
          :loading="submitting"
          :disabled="!email || !email.includes('@') || Object.keys(votes).length === 0"
          @click="submit"
        >
          {{ t('editor.datePoll.guestVoting.submit') }}
        </AppButton>
      </template>

      <div v-if="error" class="voting-form__error-inline">
        <Icon name="lucide:alert-circle" size="14" />
        {{ error }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.voting-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.voting-form__loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.voting-form__error,
.voting-form__closed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
}

.voting-form__thanks {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-4);
  text-align: center;
}

.voting-form__thanks-icon {
  color: #22c55e;
}

.voting-form__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.voting-form__legend {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.voting-form__legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.voting-form__legend-item--yes { color: #22c55e; }
.voting-form__legend-item--maybe { color: #f59e0b; }

.voting-form__identity {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
}

.voting-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.voting-form__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.voting-form__input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  outline: none;
  transition: border-color var(--transition-fast);
}

.voting-form__input:focus {
  border-color: var(--color-accent);
}

.voting-form__auto-save {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  justify-content: center;
}

.voting-form__auto-save-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.voting-form__error-inline {
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
