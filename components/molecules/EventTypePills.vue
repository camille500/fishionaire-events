<script setup>
const { t } = useI18n()
const { form, selectType, EVENT_TYPES } = useWizardState()

function onSelect(type) {
  if (form.selectedType === type) {
    selectType('')
  } else {
    selectType(type)
  }
}

function getTheme(type) {
  return useEventTheme(type)
}
</script>

<template>
  <div class="event-type-pills">
    <button
      v-for="type in EVENT_TYPES"
      :key="type"
      type="button"
      class="event-type-pill"
      :class="{ 'event-type-pill--selected': form.selectedType === type }"
      :style="form.selectedType === type ? { '--pill-color': getTheme(type).accentColor.value } : {}"
      @click="onSelect(type)"
    >
      <Icon :name="getTheme(type).icon.value" size="14" />
      <span>{{ t(`wizard.eventTypes.${type}.name`) }}</span>
    </button>
  </div>
</template>

<style scoped>
.event-type-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.event-type-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.event-type-pill:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-primary);
}

.event-type-pill--selected {
  background: var(--pill-color);
  border-color: var(--pill-color);
  color: white;
}

.event-type-pill--selected:hover {
  opacity: 0.9;
  color: white;
}
</style>
