<script setup>
const { t } = useI18n()

const props = defineProps({
  rsvpStatus: { type: String, default: 'pending' },
  rsvpLoading: { type: Boolean, default: false },
  rsvpClosed: { type: Boolean, default: false },
  visible: { type: Boolean, default: false },
  hasPoll: { type: Boolean, default: false },
  pollVoted: { type: Boolean, default: false },
})

const emit = defineEmits(['rsvp', 'changeResponse', 'scrollToPoll'])

function scrollToRsvpCard() {
  emit('scrollToPoll')
}
</script>

<template>
  <Transition name="sticky-rsvp">
    <div v-if="visible && !rsvpClosed" class="sticky-rsvp">
      <div class="sticky-rsvp__inner">
        <!-- Already responded -->
        <template v-if="rsvpStatus !== 'pending'">
          <span class="sticky-rsvp__status" :class="{ 'sticky-rsvp__status--accepted': rsvpStatus === 'accepted' }">
            <Icon :name="rsvpStatus === 'accepted' ? 'lucide:check-circle' : 'lucide:x-circle'" size="16" />
            {{ rsvpStatus === 'accepted' ? t('invite.rsvp.youreAttending') : t('invite.rsvp.youreNotAttending') }}
          </span>
          <button
            v-if="rsvpStatus === 'accepted' && hasPoll && !pollVoted"
            class="sticky-rsvp__poll-nudge"
            @click="scrollToRsvpCard"
          >
            <Icon name="lucide:bar-chart-3" size="14" />
            {{ t('invite.rsvp.voteDates') }}
          </button>
          <button v-else class="sticky-rsvp__change" @click="emit('changeResponse')">
            {{ t('invite.rsvp.changeResponse') }}
          </button>
        </template>

        <!-- Pending -->
        <template v-else>
          <button
            class="sticky-rsvp__btn sticky-rsvp__btn--accept"
            :disabled="rsvpLoading"
            @click="emit('rsvp', 'accepted')"
          >
            <Icon name="lucide:check" size="16" />
            {{ t('invite.rsvp.attending') }}
          </button>
          <button
            class="sticky-rsvp__btn sticky-rsvp__btn--decline"
            :disabled="rsvpLoading"
            @click="emit('rsvp', 'declined')"
          >
            <Icon name="lucide:x" size="16" />
            {{ t('invite.rsvp.declining') }}
          </button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sticky-rsvp {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: var(--space-3) var(--space-4);
  padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-border-light);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
}

.sticky-rsvp__inner {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.sticky-rsvp__status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  flex: 1;
  min-width: 0;
}

.sticky-rsvp__status--accepted {
  color: var(--color-success);
}

.sticky-rsvp__change {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  cursor: pointer;
  white-space: nowrap;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.sticky-rsvp__poll-nudge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--event-accent, var(--color-accent));
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 8%, transparent);
  color: var(--event-accent, var(--color-accent));
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-lg);
  cursor: pointer;
  white-space: nowrap;
  min-height: 44px;
  transition: all var(--transition-fast);
}

.sticky-rsvp__poll-nudge:hover {
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 14%, transparent);
}

.sticky-rsvp__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex: 1;
  min-height: 44px;
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sticky-rsvp__btn--accept {
  background: linear-gradient(135deg, var(--event-accent, var(--color-accent)), color-mix(in srgb, var(--event-accent, var(--color-accent)) 75%, #6c5ce7));
  color: #fff;
}

.sticky-rsvp__btn--decline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.sticky-rsvp__btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* Transition */
.sticky-rsvp-enter-active,
.sticky-rsvp-leave-active {
  transition: transform 300ms ease, opacity 300ms ease;
}

.sticky-rsvp-enter-from,
.sticky-rsvp-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Only show on mobile */
@media (min-width: 641px) {
  .sticky-rsvp {
    display: none;
  }
}
</style>
