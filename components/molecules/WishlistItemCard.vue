<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  mode: { type: String, default: 'guest', validator: (v) => ['organizer', 'guest'].includes(v) },
  selected: { type: Boolean, default: false },
  claiming: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'delete', 'claim', 'unclaim', 'purchased', 'select', 'add-note'])

const { t } = useI18n()
const showNote = ref(false)
const noteText = ref('')

const itemStatus = computed(() => {
  if (props.item.myClaim?.status === 'purchased') return 'purchased'
  if (props.item.myClaim) return 'claimed'
  if (props.item.isPoolable) {
    if (props.item.isFullyFunded) return 'funded'
    if (props.item.claimCount > 0) return 'pooling'
  }
  if (props.item.isClaimed) return 'claimed'
  return 'available'
})

const canClaim = computed(() => {
  if (props.mode !== 'guest') return false
  if (props.item.myClaim) return false
  if (!props.item.isPoolable && props.item.isClaimed) return false
  if (props.item.isPoolable && props.item.isFullyFunded) return false
  return true
})

// Claimed by someone else (not me) — should be visually faded
const isUnavailable = computed(() => {
  if (props.item.myClaim) return false
  return (itemStatus.value === 'claimed' || itemStatus.value === 'purchased' || itemStatus.value === 'funded')
})

const hasMyClaim = computed(() => !!props.item.myClaim && props.item.myClaim.status !== 'purchased')

function handleClaim() {
  emit('claim', props.item.id)
}

function handleUnclaim() {
  emit('unclaim', props.item.id)
}

function handlePurchased() {
  emit('purchased', props.item.id)
}

function submitNote() {
  if (noteText.value.trim()) {
    emit('add-note', props.item.id, noteText.value.trim())
  }
  showNote.value = false
  noteText.value = ''
}
</script>

<template>
  <div
    class="wishlist-card"
    :class="{
      'wishlist-card--unavailable': isUnavailable,
      'wishlist-card--mine': !!item.myClaim,
      'wishlist-card--selected': selected,
    }"
  >
    <!-- Selection checkbox for organizer bulk actions -->
    <label v-if="mode === 'organizer'" class="wishlist-card__select" @click.stop>
      <input type="checkbox" :checked="selected" @change="emit('select', item.id)" />
    </label>

    <!-- Image -->
    <div class="wishlist-card__image">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.title"
        class="wishlist-card__img"
      />
      <div v-else class="wishlist-card__placeholder">
        <Icon name="lucide:gift" />
      </div>
      <!-- Overlay for items claimed by someone else -->
      <div v-if="isUnavailable && mode === 'guest'" class="wishlist-card__taken-overlay">
        <Icon name="lucide:check-circle" />
        <span>{{ t('wishlist.takenByOther') }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="wishlist-card__content">
      <div class="wishlist-card__header">
        <h4 class="wishlist-card__title">{{ item.title }}</h4>
        <WishlistItemBadge :status="itemStatus" />
      </div>

      <p v-if="item.description" class="wishlist-card__desc">{{ item.description }}</p>

      <div class="wishlist-card__meta">
        <PriceTag v-if="item.priceCents" :cents="item.priceCents" :currency="item.currency" />
        <span v-if="item.category" class="wishlist-card__category">{{ t(`wishlist.categories.${item.category}`, item.category) }}</span>
        <PriorityStars v-if="item.priority > 0" :model-value="item.priority" readonly />
      </div>

      <!-- Pool progress for poolable items -->
      <PoolProgressBar
        v-if="item.isPoolable && item.poolTargetCents"
        :current="item.pooledCents || 0"
        :target="item.poolTargetCents"
        class="wishlist-card__pool"
      />

      <!-- External link -->
      <a
        v-if="item.externalUrl"
        :href="item.externalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="wishlist-card__link"
      >
        <Icon name="lucide:external-link" />
        {{ t('wishlist.viewProduct') }}
      </a>
    </div>

    <!-- Actions -->
    <div class="wishlist-card__actions">
      <!-- Organizer actions -->
      <template v-if="mode === 'organizer'">
        <button class="wishlist-card__action-btn" @click="emit('edit', item)">
          <Icon name="lucide:pencil" />
        </button>
        <button class="wishlist-card__action-btn wishlist-card__action-btn--danger" @click="emit('delete', item.id)">
          <Icon name="lucide:trash-2" />
        </button>
        <span v-if="item.claimCount > 0" class="wishlist-card__claim-count">
          <Icon name="lucide:users" />
          {{ item.claimCount }}
        </span>
      </template>

      <!-- Guest actions -->
      <template v-if="mode === 'guest'">
        <AppButton
          v-if="canClaim"
          variant="primary"
          size="sm"
          :loading="claiming"
          @click="handleClaim"
        >
          <Icon name="lucide:gift" />
          {{ t('wishlist.claim') }}
        </AppButton>

        <div v-else-if="hasMyClaim" class="wishlist-card__my-claim">
          <AppButton variant="outline" size="sm" @click="handleUnclaim">
            {{ t('wishlist.unclaim') }}
          </AppButton>
          <button
            v-if="!showNote && !item.myClaim?.message"
            class="wishlist-card__note-link"
            @click="showNote = true"
          >
            <Icon name="lucide:message-square-plus" />
            {{ t('wishlist.addNote') }}
          </button>
          <AppButton variant="ghost" size="sm" @click="handlePurchased">
            <Icon name="lucide:check" />
            {{ t('wishlist.markPurchased') }}
          </AppButton>
        </div>

        <div v-else-if="item.myClaim?.status === 'purchased'" class="wishlist-card__purchased-label">
          <Icon name="lucide:check-circle" />
          {{ t('wishlist.purchased') }}
        </div>
      </template>
    </div>

    <!-- Inline note input (appears after claiming) -->
    <div v-if="showNote && mode === 'guest'" class="wishlist-card__note-form">
      <textarea
        v-model="noteText"
        class="wishlist-card__note-input"
        :placeholder="t('wishlist.notePlaceholder')"
        rows="2"
      />
      <div class="wishlist-card__note-actions">
        <AppButton variant="primary" size="sm" @click="submitNote">
          {{ t('wishlist.sendNote') }}
        </AppButton>
        <button class="wishlist-card__note-cancel" @click="showNote = false">
          {{ t('wishlist.cancel') }}
        </button>
      </div>
    </div>

    <!-- Existing note display -->
    <div v-if="item.myClaim?.message && !showNote" class="wishlist-card__note-display">
      <Icon name="lucide:message-square" />
      <span>{{ item.myClaim.message }}</span>
    </div>
  </div>
</template>

<style scoped>
.wishlist-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
  position: relative;
  display: flex;
  flex-direction: column;
}

.wishlist-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.wishlist-card--unavailable {
  opacity: 0.5;
  filter: grayscale(40%);
  pointer-events: none;
}

.wishlist-card--unavailable:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--color-border);
}

.wishlist-card--mine {
  opacity: 1;
  filter: none;
  pointer-events: auto;
  border-color: var(--color-accent);
  box-shadow: var(--shadow-accent-sm);
}

.wishlist-card--selected {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 4%, var(--color-surface));
}

.wishlist-card__select {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 2;
  cursor: pointer;
}

.wishlist-card__select input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
}

.wishlist-card__image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
}

.wishlist-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wishlist-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: color-mix(in srgb, var(--color-text-primary) 15%, transparent);
  font-size: 2rem;
}

.wishlist-card__taken-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  backdrop-filter: blur(2px);
}

.wishlist-card__content {
  padding: var(--space-3);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.wishlist-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.wishlist-card__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.wishlist-card__desc {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wishlist-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.wishlist-card__category {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
}

.wishlist-card__pool {
  margin-top: var(--space-1);
}

.wishlist-card__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-accent);
  text-decoration: none;
}

.wishlist-card__link:hover {
  text-decoration: underline;
}

.wishlist-card__actions {
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.wishlist-card__action-btn {
  background: none;
  border: none;
  padding: var(--space-1);
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.wishlist-card__action-btn:hover {
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  color: var(--color-text-primary);
}

.wishlist-card__action-btn--danger:hover {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}

.wishlist-card__claim-count {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.wishlist-card__my-claim {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.wishlist-card__note-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: var(--text-xs);
  color: var(--color-accent);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.wishlist-card__note-link:hover {
  text-decoration: underline;
}

.wishlist-card__purchased-label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.wishlist-card__note-form {
  padding: var(--space-2) var(--space-3) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.wishlist-card__note-input {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  resize: none;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.wishlist-card__note-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.wishlist-card__note-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.wishlist-card__note-cancel {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.wishlist-card__note-display {
  padding: var(--space-2) var(--space-3);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}
</style>
