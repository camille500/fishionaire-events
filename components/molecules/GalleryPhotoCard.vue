<script setup>
const { t } = useI18n()

const props = defineProps({
  photo: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open', 'delete', 'set-cover', 'toggle-select'])

const timeAgo = computed(() => {
  const now = new Date()
  const date = new Date(props.photo.createdAt)
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
})

const uploaderLabel = computed(() => {
  if (props.photo.uploaderName) return props.photo.uploaderName
  if (props.photo.uploadedBy === 'guest') return props.photo.uploaderEmail || 'Guest'
  return 'Organizer'
})
</script>

<template>
  <div
    class="gallery-card"
    :class="{ 'gallery-card--selected': selected }"
    @click="selectable ? emit('toggle-select', photo.id) : emit('open', photo)"
  >
    <img
      :src="photo.imageUrl"
      :alt="photo.caption || 'Gallery photo'"
      class="gallery-card__image"
      loading="lazy"
    />

    <div class="gallery-card__overlay">
      <div class="gallery-card__info">
        <span class="gallery-card__uploader">{{ uploaderLabel }}</span>
        <span class="gallery-card__time">{{ timeAgo }}</span>
      </div>
      <div v-if="editable && !selectable" class="gallery-card__actions">
        <button
          class="gallery-card__action"
          :title="t('gallery.setAsCover')"
          @click.stop="emit('set-cover', photo.id)"
        >
          <Icon name="lucide:image" size="14" />
        </button>
        <button
          class="gallery-card__action gallery-card__action--danger"
          :title="t('gallery.deleteConfirm')"
          @click.stop="emit('delete', photo.id)"
        >
          <Icon name="lucide:trash-2" size="14" />
        </button>
      </div>
    </div>

    <div v-if="photo.caption" class="gallery-card__caption">
      {{ photo.caption }}
    </div>

    <div v-if="selectable" class="gallery-card__checkbox">
      <input
        type="checkbox"
        :checked="selected"
        @click.stop="emit('toggle-select', photo.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.gallery-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  background: var(--color-background);
  border: 2px solid transparent;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.gallery-card:hover {
  transform: scale(1.02);
}

.gallery-card--selected {
  border-color: var(--color-accent);
}

.gallery-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
  opacity: 0;
  transition: opacity var(--transition-fast);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-3);
}

.gallery-card:hover .gallery-card__overlay {
  opacity: 1;
}

.gallery-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gallery-card__uploader {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: #fff;
}

.gallery-card__time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.gallery-card__actions {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: flex;
  gap: var(--space-1);
}

.gallery-card__action {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}

.gallery-card__action:hover {
  background: rgba(0, 0, 0, 0.8);
}

.gallery-card__action--danger:hover {
  background: var(--color-error, #e74c3c);
}

.gallery-card__caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-2) var(--space-3);
  background: rgba(0, 0, 0, 0.5);
  font-size: var(--text-xs);
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gallery-card__checkbox {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
}

.gallery-card__checkbox input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
  cursor: pointer;
}
</style>
