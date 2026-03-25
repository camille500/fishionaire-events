<script setup>
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  tierFeatures: {
    type: Object,
    default: () => ({}),
  },
  featureTierMap: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'locked-click'])

const featureDefinitions = [
  { key: 'rsvp', icon: 'users' },
  { key: 'datePolling', icon: 'bar-chart-3' },
  { key: 'wishlist', icon: 'gift' },
  { key: 'secretChat', icon: 'message-circle' },
  { key: 'photoGallery', icon: 'camera' },
  { key: 'socialWall', icon: 'message-circle-heart' },
  { key: 'checkIn', icon: 'scan-line' },
  { key: 'analytics', icon: 'bar-chart-2' },
  { key: 'aiAssistant', icon: 'sparkles' },
  { key: 'budgetTracker', icon: 'wallet' },
  { key: 'seatingArrangements', icon: 'grid-3x3' },
  { key: 'timeline', icon: 'clock' },
  { key: 'customTheme', icon: 'paintbrush' },
]

const sortedFeatures = computed(() => {
  const available = []
  const locked = []
  for (const f of featureDefinitions) {
    if (props.tierFeatures[f.key]) {
      available.push(f)
    } else {
      locked.push(f)
    }
  }
  return [...available, ...locked]
})

function isLocked(key) {
  return !props.tierFeatures[key]
}

function getTierBadge(key) {
  if (!isLocked(key)) return ''
  const tier = props.featureTierMap[key]
  return tier ? t(`tiers.${tier}`) : ''
}

function toggleFeature(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="feature-toggles-grid">
    <FeatureToggle
      v-for="feature in sortedFeatures"
      :key="feature.key"
      :icon="feature.icon"
      :label="t(`dashboard.eventEditor.features.${feature.key}.label`)"
      :description="t(`dashboard.eventEditor.features.${feature.key}.description`)"
      :model-value="modelValue[feature.key] || false"
      :locked="isLocked(feature.key)"
      :tier-badge="getTierBadge(feature.key)"
      @update:model-value="toggleFeature(feature.key, $event)"
      @locked-click="emit('locked-click', feature.key)"
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
