<script setup>
const props = defineProps({
  photos: {
    type: Array,
    required: true,
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex)

const currentPhoto = computed(() => props.photos[currentIndex.value])
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.photos.length - 1)

function prev() {
  if (hasPrev.value) currentIndex.value--
}

function next() {
  if (hasNext.value) currentIndex.value++
}

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

const timeFormatted = computed(() => {
  if (!currentPhoto.value?.createdAt) return ''
  return new Date(currentPhoto.value.createdAt).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const uploaderLabel = computed(() => {
  const photo = currentPhoto.value
  if (!photo) return ''
  if (photo.uploaderName) return photo.uploaderName
  if (photo.uploadedBy === 'guest') return photo.uploaderEmail || 'Guest'
  return 'Organizer'
})
</script>

<template>
  <Teleport to="body">
    <div class="lightbox" @click.self="emit('close')">
      <button class="lightbox__close" @click="emit('close')">
        <Icon name="lucide:x" size="24" />
      </button>

      <button v-if="hasPrev" class="lightbox__nav lightbox__nav--prev" @click="prev">
        <Icon name="lucide:chevron-left" size="28" />
      </button>

      <div class="lightbox__content">
        <img
          v-if="currentPhoto"
          :src="currentPhoto.imageUrl"
          :alt="currentPhoto.caption || 'Photo'"
          class="lightbox__image"
        />
        <div v-if="currentPhoto" class="lightbox__info">
          <span v-if="currentPhoto.caption" class="lightbox__caption">{{ currentPhoto.caption }}</span>
          <span class="lightbox__meta">{{ uploaderLabel }} · {{ timeFormatted }}</span>
          <span class="lightbox__counter">{{ currentIndex + 1 }} / {{ photos.length }}</span>
        </div>
      </div>

      <button v-if="hasNext" class="lightbox__nav lightbox__nav--next" @click="next">
        <Icon name="lucide:chevron-right" size="28" />
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox__close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  z-index: 10;
}

.lightbox__close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  z-index: 10;
}

.lightbox__nav:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.lightbox__nav--prev {
  left: var(--space-4);
}

.lightbox__nav--next {
  right: var(--space-4);
}

.lightbox__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox__image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.lightbox__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  text-align: center;
}

.lightbox__caption {
  font-size: var(--text-sm);
  color: #fff;
  font-weight: var(--font-weight-medium);
}

.lightbox__meta {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.5);
}

.lightbox__counter {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .lightbox__nav {
    width: 36px;
    height: 36px;
  }

  .lightbox__nav--prev {
    left: var(--space-2);
  }

  .lightbox__nav--next {
    right: var(--space-2);
  }
}
</style>
