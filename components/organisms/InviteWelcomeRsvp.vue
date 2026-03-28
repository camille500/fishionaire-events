<script setup>
const { t, locale } = useI18n()

const timeLocale = computed(() => locale.value === 'nl' ? 'nl-NL' : 'en-GB')

const props = defineProps({
  eventData: { type: Object, required: true },
  invitation: { type: Object, default: null },
  isPlusOne: { type: Boolean, default: false },
  invitedByName: { type: String, default: '' },
  rsvpStatus: { type: String, default: 'pending' },
  rsvpLoading: { type: Boolean, default: false },
  subEvents: { type: Array, default: () => [] },
  subEventRsvps: { type: Object, default: () => ({}) },
  hasPoll: { type: Boolean, default: false },
  eventId: { type: Number, default: 0 },
  token: { type: String, default: '' },
  initialEmail: { type: String, default: '' },
  initialName: { type: String, default: '' },
  accentColor: { type: String, default: '#00b894' },
  welcomeMessage: { type: String, default: null },
})

const emit = defineEmits(['rsvp', 'changeResponse', 'subEventRsvp', 'pollVoted'])

const pollVoted = ref(false)

const rsvpClosed = computed(() => {
  if (!props.eventData.rsvpEnabled) return true
  if (props.eventData.rsvpDeadline && new Date() > new Date(props.eventData.rsvpDeadline)) return true
  return false
})

const deadlineLabel = computed(() => {
  if (!props.eventData.rsvpDeadline) return ''
  const d = new Date(props.eventData.rsvpDeadline)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
})

const showConfetti = ref(false)
const confettiParticles = ref([])

function triggerConfetti() {
  showConfetti.value = true
  const colors = [props.accentColor, '#6c5ce7', '#ff6b6b', '#ffd93d', '#74b9ff', '#fd79a8']
  confettiParticles.value = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    x: 50 + (Math.random() - 0.5) * 60,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }))
  setTimeout(() => { showConfetti.value = false }, 3000)
}

function handleRsvp(status) {
  emit('rsvp', status)
  if (status === 'accepted') {
    setTimeout(triggerConfetti, 300)
  }
}
</script>

<template>
  <section class="invite-rsvp-section">
    <!-- Confetti overlay -->
    <div v-if="showConfetti" class="invite-rsvp__confetti" aria-hidden="true">
      <span
        v-for="p in confettiParticles"
        :key="p.id"
        class="invite-rsvp__confetti-particle"
        :style="{
          '--x': p.x + '%',
          '--color': p.color,
          '--delay': p.delay + 's',
          '--duration': p.duration + 's',
          '--rotation': p.rotation + 'deg',
          '--size': p.size + 'px',
        }"
      />
    </div>

    <div class="invite-rsvp__card">
      <!-- Welcome icon -->
      <div class="invite-rsvp__icon">
        <Icon :name="isPlusOne ? 'lucide:user-plus' : 'lucide:party-popper'" size="32" />
      </div>

      <!-- Greeting -->
      <h2 class="invite-rsvp__greeting">
        <template v-if="isPlusOne">
          {{ t('invite.welcomePlusOne', { event: eventData.title, inviter: invitedByName }) }}
        </template>
        <template v-else-if="invitation?.inviteeName">
          {{ t('invite.welcomeNamed', { name: invitation.inviteeName }) }}
        </template>
        <template v-else>
          {{ t('invite.welcome') }}
        </template>
      </h2>

      <!-- Personal welcome message -->
      <div v-if="welcomeMessage" class="invite-rsvp__welcome-message">
        <div class="invite-rsvp__welcome-text" v-html="welcomeMessage"></div>
      </div>

      <!-- Plus-one context -->
      <p v-if="isPlusOne && invitedByName" class="invite-rsvp__plus-one-context">
        <Icon name="lucide:heart" size="14" />
        {{ t('invite.plusOneContext', { name: invitedByName }) }}
      </p>

      <!-- Description -->
      <FormattedText
        v-if="eventData.description"
        :text="eventData.description"
        tag="p"
        class="invite-rsvp__description"
      />

      <!-- Divider -->
      <div class="invite-rsvp__divider" />

      <!-- RSVP section label -->
      <p class="invite-rsvp__label">{{ t('invite.rsvp.title') }}</p>

      <!-- Deadline info with countdown -->
      <div v-if="eventData.rsvpDeadline && !rsvpClosed" class="invite-rsvp__deadline">
        <p class="invite-rsvp__deadline-text">
          <Icon name="lucide:clock" size="14" />
          {{ t('invite.rsvp.deadlineNote', { date: deadlineLabel }) }}
        </p>
        <CountdownTimer
          :target-date="eventData.rsvpDeadline"
          variant="urgent"
        />
      </div>

      <!-- RSVP closed -->
      <div v-if="rsvpClosed" class="invite-rsvp__closed">
        <Icon name="lucide:lock" size="18" />
        <span>{{ t('invite.rsvp.closed') }}</span>
      </div>

      <!-- RSVP status (if already responded) -->
      <div v-else-if="rsvpStatus !== 'pending'" class="invite-rsvp__status">
        <div
          class="invite-rsvp__status-badge"
          :class="{
            'invite-rsvp__status-badge--accepted': rsvpStatus === 'accepted',
            'invite-rsvp__status-badge--declined': rsvpStatus === 'declined',
          }"
        >
          <Icon :name="rsvpStatus === 'accepted' ? 'lucide:check-circle' : 'lucide:x-circle'" size="22" />
          {{ rsvpStatus === 'accepted' ? t('invite.rsvp.youreAttending') : t('invite.rsvp.youreNotAttending') }}
        </div>
        <!-- Per-sub-event RSVP selection -->
        <div v-if="rsvpStatus === 'accepted' && subEvents.length > 1" class="invite-rsvp__sub-events">
          <p class="invite-rsvp__sub-events-label">
            <Icon name="lucide:list-checks" size="14" />
            {{ t('invite.rsvp.whichParts') }}
          </p>
          <div
            v-for="se in subEvents"
            :key="se.id"
            class="invite-rsvp__sub-event-row"
          >
            <label class="invite-rsvp__sub-event-toggle">
              <input
                type="checkbox"
                :checked="subEventRsvps[se.id] !== 'declined'"
                @change="$emit('subEventRsvp', se.id, $event.target.checked ? 'accepted' : 'declined')"
              />
              <span class="invite-rsvp__sub-event-name">{{ se.title }}</span>
              <span v-if="se.startTime" class="invite-rsvp__sub-event-time">
                {{ new Date(se.startTime).toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </label>
          </div>
        </div>

        <AddToCalendarButton
          v-if="rsvpStatus === 'accepted' && eventData.eventDate"
          :event-id="eventData.id"
          :title="eventData.title"
          :description="eventData.description"
          :location="eventData.location"
          :start-date="eventData.eventDate"
          :end-date="eventData.eventEndDate"
        />
        <button class="invite-rsvp__change-btn" @click="$emit('changeResponse')">
          {{ t('invite.rsvp.changeResponse') }}
        </button>
      </div>

      <!-- RSVP buttons (pending) -->
      <div v-else class="invite-rsvp__buttons">
        <button
          class="invite-rsvp__btn invite-rsvp__btn--accept"
          :disabled="rsvpLoading"
          @click="handleRsvp('accepted')"
        >
          <Icon name="lucide:check" size="22" />
          {{ t('invite.rsvp.attending') }}
        </button>
        <button
          class="invite-rsvp__btn invite-rsvp__btn--decline"
          :disabled="rsvpLoading"
          @click="handleRsvp('declined')"
        >
          <Icon name="lucide:x" size="18" />
          {{ t('invite.rsvp.declining') }}
        </button>
      </div>

      <!-- Inline date poll step (after accepting, when poll is active) -->
      <Transition name="expand">
        <div v-if="rsvpStatus === 'accepted' && hasPoll" class="invite-rsvp__poll-step">
          <!-- Step indicator -->
          <div class="invite-rsvp__steps">
            <div class="invite-rsvp__step invite-rsvp__step--done">
              <div class="invite-rsvp__step-dot">
                <Icon name="lucide:check" size="12" />
              </div>
              <span>{{ t('invite.rsvp.stepRsvp') }}</span>
            </div>
            <div class="invite-rsvp__step-line" />
            <div class="invite-rsvp__step" :class="{ 'invite-rsvp__step--done': pollVoted }">
              <div class="invite-rsvp__step-dot">
                <Icon :name="pollVoted ? 'lucide:check' : 'lucide:calendar'" size="12" />
              </div>
              <span>{{ t('invite.rsvp.stepDates') }}</span>
            </div>
          </div>

          <!-- Poll section label -->
          <p class="invite-rsvp__poll-label">
            <Icon name="lucide:bar-chart-3" size="14" />
            {{ t('invite.rsvp.datePollStep') }}
          </p>

          <!-- Inline date poll voting -->
          <InviteRsvpDatePollStep
            :event-id="eventId"
            :token="token"
            :initial-email="initialEmail"
            :initial-name="initialName"
            @voted="pollVoted = true; emit('pollVoted')"
          />
        </div>
      </Transition>

      <!-- Plus-ones note -->
      <p v-if="invitation?.plusOnes > 0 && !isPlusOne" class="invite-rsvp__plus-note">
        <Icon name="lucide:user-plus" size="14" />
        {{ t('invite.rsvp.plusOnesNote', { count: invitation.plusOnes }) }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.invite-rsvp-section {
  position: relative;
  z-index: 2;
  margin-top: -5rem;
  padding: 0 var(--space-6);
  animation: rsvpReveal 700ms ease-out 400ms both;
}

@keyframes rsvpReveal {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.invite-rsvp__card {
  max-width: 560px;
  margin: 0 auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-10) var(--space-8);
  box-shadow: var(--shadow-xl);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

/* Icon */
.invite-rsvp__icon {
  width: 68px;
  height: 68px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--event-accent, var(--color-accent)), color-mix(in srgb, var(--event-accent, var(--color-accent)) 65%, var(--color-accent-secondary, #6c5ce7)));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--event-accent, var(--color-accent)) 25%, transparent);
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 8px 32px color-mix(in srgb, var(--event-accent, var(--color-accent)) 25%, transparent); }
  50% { box-shadow: 0 8px 48px color-mix(in srgb, var(--event-accent, var(--color-accent)) 40%, transparent); }
}

/* Greeting */
.invite-rsvp__greeting {
  font-family: var(--font-family-heading);
  font-size: clamp(var(--text-xl), 3.5vw, var(--text-3xl));
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  margin: 0;
}

/* Personal welcome message */
.invite-rsvp__welcome-message {
  width: 100%;
  max-width: 440px;
  padding: var(--space-4);
  border-left: 3px solid var(--event-accent, var(--color-accent));
  background: var(--color-accent-dim, rgba(0, 0, 0, 0.02));
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  text-align: left;
}

.invite-rsvp__welcome-text {
  font-size: var(--text-base);
  font-style: italic;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.invite-rsvp__plus-one-context {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-accent-violet);
  margin: 0;
}

.invite-rsvp__description {
  color: var(--color-text-secondary);
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  max-width: 440px;
  margin: 0;
}

/* Divider */
.invite-rsvp__divider {
  width: 48px;
  height: 2px;
  border-radius: 1px;
  background: linear-gradient(90deg, var(--event-accent, var(--color-accent)), color-mix(in srgb, var(--event-accent, var(--color-accent)) 50%, var(--color-accent-secondary, #6c5ce7)));
  margin: var(--space-2) 0;
}

/* RSVP label */
.invite-rsvp__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin: 0;
}

/* Deadline */
.invite-rsvp__deadline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
}

.invite-rsvp__deadline-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* Closed */
.invite-rsvp__closed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-text-muted) 8%, transparent);
  color: var(--color-text-muted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
}

/* Status */
.invite-rsvp__status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.invite-rsvp__status-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
}

.invite-rsvp__status-badge--accepted {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}

.invite-rsvp__status-badge--declined {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}

.invite-rsvp__change-btn {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.invite-rsvp__change-btn:hover {
  opacity: 1;
}

/* Buttons */
.invite-rsvp__buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 320px;
}

.invite-rsvp__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  border: none;
  border-radius: var(--radius-xl);
  font-family: var(--font-family);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.invite-rsvp__btn--accept {
  padding: var(--space-5) var(--space-8);
  font-size: var(--text-lg);
  background: linear-gradient(135deg, var(--event-accent, var(--color-accent)), color-mix(in srgb, var(--event-accent, var(--color-accent)) 75%, var(--color-accent-secondary, #6c5ce7)));
  color: #fff;
  box-shadow: 0 4px 24px color-mix(in srgb, var(--event-accent, var(--color-accent)) 30%, transparent);
}

.invite-rsvp__btn--accept:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 36px color-mix(in srgb, var(--event-accent, var(--color-accent)) 40%, transparent);
}

.invite-rsvp__btn--accept:active:not(:disabled) {
  transform: translateY(0);
}

.invite-rsvp__btn--decline {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-light);
}

.invite-rsvp__btn--decline:hover:not(:disabled) {
  border-color: var(--color-error);
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 5%, transparent);
}

.invite-rsvp__btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* Sub-event selection */
.invite-rsvp__sub-events {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--event-accent, var(--color-accent)) 12%, transparent);
  border-radius: var(--radius-xl);
}

.invite-rsvp__sub-events-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-1) 0;
}

.invite-rsvp__sub-event-row {
  padding: var(--space-1) 0;
}

.invite-rsvp__sub-event-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--text-sm);
}

.invite-rsvp__sub-event-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--event-accent, var(--color-accent));
  cursor: pointer;
  flex-shrink: 0;
}

.invite-rsvp__sub-event-name {
  flex: 1;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: left;
}

.invite-rsvp__sub-event-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* Plus-ones note */
.invite-rsvp__plus-note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
  width: 100%;
  justify-content: center;
}

/* Poll step */
.invite-rsvp__poll-step {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-light);
}

.invite-rsvp__steps {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.invite-rsvp__step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.invite-rsvp__step--done {
  color: var(--color-success);
}

.invite-rsvp__step-dot {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-border-light);
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.invite-rsvp__step--done .invite-rsvp__step-dot {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}

.invite-rsvp__step-line {
  width: 32px;
  height: 2px;
  background: var(--color-border-light);
  border-radius: 1px;
}

.invite-rsvp__poll-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.invite-rsvp__poll-label :deep(.iconify) {
  color: var(--event-accent, var(--color-accent));
}

/* Expand transition */
.expand-enter-active {
  animation: expandIn 500ms ease-out;
  overflow: hidden;
}

.expand-leave-active {
  animation: expandIn 300ms ease-in reverse;
  overflow: hidden;
}

@keyframes expandIn {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 600px;
    transform: translateY(0);
  }
}

/* Confetti */
.invite-rsvp__confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
}

.invite-rsvp__confetti-particle {
  position: absolute;
  left: var(--x);
  top: 40%;
  width: var(--size);
  height: var(--size);
  background: var(--color);
  border-radius: 2px;
  animation: confettiBurst var(--duration) ease-out var(--delay) both;
}

@keyframes confettiBurst {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-200px) rotate(var(--rotation)) scale(0.5) translateX(calc((var(--x) - 50%) * 3));
  }
}

/* Responsive */
@media (max-width: 640px) {
  .invite-rsvp-section {
    margin-top: -3rem;
    padding: 0 var(--space-4);
  }

  .invite-rsvp__card {
    padding: var(--space-8) var(--space-5);
  }
}
</style>
