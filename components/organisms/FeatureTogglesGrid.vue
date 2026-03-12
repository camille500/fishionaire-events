<script setup>
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const featureDefinitions = [
  { key: 'rsvp', icon: 'users' },
  { key: 'datePolling', icon: 'bar-chart-3' },
  { key: 'wishlist', icon: 'gift' },
  { key: 'secretChat', icon: 'message-circle' },
  { key: 'photoGallery', icon: 'camera' },
  { key: 'budgetTracker', icon: 'wallet' },
  { key: 'seatingArrangements', icon: 'grid-3x3' },
  { key: 'timeline', icon: 'clock' },
  { key: 'customTheme', icon: 'paintbrush' },
]

function toggleFeature(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="feature-toggles-grid">
    <FeatureToggle
      v-for="feature in featureDefinitions"
      :key="feature.key"
      :icon="feature.icon"
      :label="t(`dashboard.eventEditor.features.${feature.key}.label`)"
      :description="t(`dashboard.eventEditor.features.${feature.key}.description`)"
      :model-value="modelValue[feature.key] || false"
      @update:model-value="toggleFeature(feature.key, $event)"
    />
  </div>
</template>

<style scoped>
.feature-toggles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}
</style>
