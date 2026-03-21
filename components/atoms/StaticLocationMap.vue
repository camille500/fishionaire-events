<script setup>
const { t } = useI18n()

const props = defineProps({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  label: { type: String, default: '' },
})

const mapUrl = computed(() =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${props.lat},${props.lon}&zoom=15&size=600x300&markers=${props.lat},${props.lon},red-pushpin`
)

const navigationUrl = computed(() =>
  `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lon}`
)

const imageError = ref(false)
</script>

<template>
  <div v-if="!imageError" class="location-map">
    <a
      :href="navigationUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="location-map__link"
    >
      <img
        :src="mapUrl"
        :alt="label || t('invite.location.mapAlt')"
        class="location-map__image"
        loading="lazy"
        @error="imageError = true"
      />
      <div class="location-map__overlay">
        <span class="location-map__navigate">
          <Icon name="lucide:navigation" size="14" />
          {{ t('invite.location.navigate') }}
        </span>
      </div>
    </a>
    <div v-if="label" class="location-map__label">
      <Icon name="lucide:map-pin" size="14" />
      <span>{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.location-map {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  background: var(--color-surface);
}

.location-map__link {
  display: block;
  position: relative;
  text-decoration: none;
  line-height: 0;
}

.location-map__image {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 2 / 1;
  object-fit: cover;
}

.location-map__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  transition: background var(--transition-base);
}

.location-map__link:hover .location-map__overlay {
  background: rgba(0, 0, 0, 0.35);
}

.location-map__navigate {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  box-shadow: var(--shadow-md);
  opacity: 0;
  transform: translateY(4px);
  transition: all var(--transition-base);
}

.location-map__link:hover .location-map__navigate {
  opacity: 1;
  transform: translateY(0);
}

.location-map__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border-light);
}

.location-map__label :deep(.iconify) {
  color: var(--event-accent, var(--color-accent));
  flex-shrink: 0;
}
</style>
