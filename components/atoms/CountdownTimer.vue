<script setup>
const { t } = useI18n()

const props = defineProps({
  targetDate: { type: String, default: null },
  variant: { type: String, default: 'default' },
})

const dateRef = computed(() => props.targetDate)
const { days, hours, minutes, isPast, hasTarget } = useCountdown(dateRef)
</script>

<template>
  <div v-if="hasTarget && !isPast" class="countdown" :class="`countdown--${variant}`">
    <div class="countdown__segment">
      <span class="countdown__value">{{ days }}</span>
      <span class="countdown__label">{{ t('invite.countdown.days') }}</span>
    </div>
    <span class="countdown__separator">:</span>
    <div class="countdown__segment">
      <span class="countdown__value">{{ hours }}</span>
      <span class="countdown__label">{{ t('invite.countdown.hours') }}</span>
    </div>
    <span class="countdown__separator">:</span>
    <div class="countdown__segment">
      <span class="countdown__value">{{ minutes }}</span>
      <span class="countdown__label">{{ t('invite.countdown.minutes') }}</span>
    </div>
  </div>
  <div v-else-if="hasTarget && isPast" class="countdown countdown--past" :class="`countdown--${variant}`">
    <span class="countdown__past-label">{{ t('invite.countdown.eventPassed') }}</span>
  </div>
</template>

<style scoped>
.countdown {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.countdown--hero {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-5);
  color: #fff;
}

.countdown--hero .countdown__value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-heading);
}

.countdown--hero .countdown__label {
  font-size: var(--text-xs);
  opacity: 0.7;
}

.countdown--hero .countdown__separator {
  font-size: var(--text-lg);
  opacity: 0.4;
  margin: 0 var(--space-1);
}

/* Default variant */
.countdown--default {
  color: var(--color-text-secondary);
}

.countdown--default .countdown__value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-heading);
}

.countdown--default .countdown__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.countdown--default .countdown__separator {
  color: var(--color-text-muted);
  opacity: 0.5;
}

/* Urgent variant (for RSVP deadline) */
.countdown--urgent {
  color: var(--color-warning, #ff9f43);
}

.countdown--urgent .countdown__value {
  font-size: var(--text-base);
  font-weight: var(--font-weight-bold);
}

.countdown--urgent .countdown__label {
  font-size: 10px;
  opacity: 0.8;
}

.countdown--urgent .countdown__separator {
  opacity: 0.4;
}

.countdown__segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2.2em;
}

.countdown__past-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  opacity: 0.7;
}

.countdown--hero .countdown__past-label {
  color: rgba(255, 255, 255, 0.8);
}
</style>
