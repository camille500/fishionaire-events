<script setup>
defineProps({
  role: {
    type: String,
    required: true,
    validator: (v) => ['user', 'assistant'].includes(v),
  },
  content: {
    type: String,
    default: '',
  },
  isResult: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <div class="chat-bubble" :class="`chat-bubble--${role}`">
    <div v-if="role === 'assistant'" class="chat-bubble__avatar">
      <Icon name="lucide:sparkles" size="14" />
    </div>
    <div class="chat-bubble__body">
      <p class="chat-bubble__text">{{ content }}</p>
      <div v-if="isResult && event" class="chat-bubble__event-card">
        <div class="chat-bubble__event-header">
          <Icon name="lucide:party-popper" size="14" />
          <strong>{{ event.title }}</strong>
        </div>
        <div v-if="event.description" class="chat-bubble__event-detail">
          {{ event.description }}
        </div>
        <div class="chat-bubble__event-meta">
          <span v-if="event.dateSuggestion" class="chat-bubble__event-tag">
            <Icon name="lucide:calendar" size="12" />
            {{ event.dateSuggestion.dayOfWeek }} {{ event.dateSuggestion.suggestedTime }}
          </span>
          <span v-if="event.location" class="chat-bubble__event-tag">
            <Icon name="lucide:map-pin" size="12" />
            {{ event.location }}
          </span>
          <span v-if="event.eventType" class="chat-bubble__event-tag">
            <Icon name="lucide:tag" size="12" />
            {{ event.eventType }}
          </span>
        </div>
        <div v-if="event.activities && event.activities.length" class="chat-bubble__event-activities">
          <span
            v-for="(activity, i) in event.activities"
            :key="i"
            class="chat-bubble__event-activity"
          >
            {{ activity.title }}
            <span v-if="activity.durationMinutes" class="chat-bubble__event-duration">
              {{ activity.durationMinutes }}min
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-bubble {
  display: flex;
  gap: var(--space-2);
  max-width: 85%;
  animation: bubble-in 200ms ease-out;
}

.chat-bubble--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.chat-bubble--assistant {
  align-self: flex-start;
}

.chat-bubble__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.chat-bubble__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.chat-bubble--user .chat-bubble__body {
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
  padding: var(--space-2) var(--space-3);
}

.chat-bubble--assistant .chat-bubble__body {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
  padding: var(--space-2) var(--space-3);
}

.chat-bubble__text {
  font-size: var(--text-sm);
  line-height: var(--line-height-normal);
  margin: 0;
  white-space: pre-wrap;
}

/* Event card within result bubble */
.chat-bubble__event-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  margin-top: var(--space-1);
}

.chat-bubble__event-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.chat-bubble__event-detail {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

.chat-bubble__event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chat-bubble__event-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}

.chat-bubble__event-activities {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.chat-bubble__event-activity {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}

.chat-bubble__event-duration {
  color: var(--color-text-muted);
  font-size: 10px;
}

@keyframes bubble-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
