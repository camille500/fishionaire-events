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
  { key: 'datePolling', icon: 'chart' },
  { key: 'wishlist', icon: 'gift' },
  { key: 'secretChat', icon: 'message' },
  { key: 'photoGallery', icon: 'camera' },
  { key: 'budgetTracker', icon: 'wallet' },
  { key: 'seatingArrangements', icon: 'grid' },
  { key: 'timeline', icon: 'clock' },
  { key: 'customTheme', icon: 'palette' },
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
