<script setup>
const { t } = useI18n()

const props = defineProps({
  eventType: { type: String, required: true },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])
const { icon, accentColor } = useEventTheme(computed(() => props.eventType))
</script>

<template>
  <button
    type="button"
    class="event-type-card"
    :class="{ 'event-type-card--selected': selected }"
    :data-event-type="eventType"
    @click="emit('select', eventType)"
  >
    <div class="event-type-card__icon">
      <Icon :name="icon" size="28" />
    </div>
    <span class="event-type-card__name">{{ t(`wizard.eventTypes.${eventType}.name`) }}</span>
    <span class="event-type-card__desc">{{ t(`wizard.eventTypes.${eventType}.description`) }}</span>
  </button>
</template>

<style scoped>
.event-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-4);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  cursor: pointer;
  font-family: var(--font-family);
  text-align: center;
  transition: all var(--transition-base);
}

.event-type-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.event-type-card--selected {
  border-color: var(--color-accent);
  background: var(--color-accent-bg);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.event-type-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  transition: all var(--transition-base);
}

.event-type-card:hover .event-type-card__icon,
.event-type-card--selected .event-type-card__icon {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.event-type-card__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.event-type-card__desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}
</style>
