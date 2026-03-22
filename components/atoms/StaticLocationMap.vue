<script setup>
const { t } = useI18n()

const props = defineProps({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  label: { type: String, default: '' },
})

const mapContainer = ref(null)
const mapReady = ref(false)
let mapInstance = null

const navigationUrl = computed(() =>
  `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lon}`
)

const staticMapUrl = computed(() =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${props.lat},${props.lon}&zoom=15&size=600x300&markers=${props.lat},${props.lon},red-pushpin`
)

const imageError = ref(false)

if (import.meta.client) {
  onMounted(async () => {
    if (!mapContainer.value) return

    try {
      const leafletModule = await import('leaflet')
      const L = leafletModule.default || leafletModule

      mapInstance = L.map(mapContainer.value, {
        center: [props.lat, props.lon],
        zoom: 15,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstance)

      const markerIcon = L.divIcon({
        className: 'location-map__marker',
        html: '<svg width="28" height="42" viewBox="0 0 28 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 28 14 28s14-17.5 14-28C28 6.3 21.7 0 14 0z" fill="var(--event-accent, var(--color-accent))"/><circle cx="14" cy="14" r="6" fill="white"/></svg>',
        iconSize: [28, 42],
        iconAnchor: [14, 42],
      })

      L.marker([props.lat, props.lon], { icon: markerIcon }).addTo(mapInstance)

      await nextTick()
      mapInstance.invalidateSize()
      mapReady.value = true
    } catch (err) {
      console.error('Leaflet init failed:', err)
    }
  })

  onUnmounted(() => {
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
    }
  })
}
</script>

<template>
  <div class="location-map">
    <div class="location-map__interactive-wrapper">
      <div ref="mapContainer" class="location-map__interactive" />
      <!-- Static fallback shown until Leaflet renders -->
      <a
        v-if="!mapReady && !imageError"
        :href="navigationUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="location-map__fallback"
      >
        <img
          :src="staticMapUrl"
          :alt="label || t('invite.location.mapAlt')"
          class="location-map__image"
          loading="lazy"
          @error="imageError = true"
        />
      </a>
      <a
        v-if="mapReady"
        :href="navigationUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="location-map__nav-button"
      >
        <Icon name="lucide:navigation" size="14" />
        {{ t('invite.location.navigate') }}
      </a>
    </div>

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

/* ── Interactive map ──────────────────── */
.location-map__interactive-wrapper {
  position: relative;
  aspect-ratio: 2 / 1;
  min-height: 200px;
}

.location-map__interactive {
  position: absolute;
  inset: 0;
}

.location-map__interactive :deep(.leaflet-control-zoom a) {
  color: var(--color-text-primary);
  border-color: var(--color-border-light);
}

/* ── Static fallback (overlaid, hidden once map loads) ── */
.location-map__fallback {
  position: absolute;
  inset: 0;
  display: block;
  text-decoration: none;
  line-height: 0;
  z-index: 500;
}

.location-map__image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* ── Navigate button ──────────────────── */
.location-map__nav-button {
  position: absolute;
  bottom: var(--space-3);
  right: var(--space-3);
  z-index: 1000;
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
  text-decoration: none;
  transition: all var(--transition-base);
}

.location-map__nav-button:hover {
  background: #ffffff;
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

/* ── Custom marker (remove Leaflet default styling) ── */
:deep(.location-map__marker) {
  background: none !important;
  border: none !important;
}

/* ── Label ────────────────────────────── */
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
