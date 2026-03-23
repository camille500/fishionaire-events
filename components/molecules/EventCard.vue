<script setup>
const { t, locale } = useI18n()

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['invited', 'duplicate', 'archive'])

const effectiveRole = computed(() => props.role || (props.isOwner ? 'owner' : 'guest'))
const canEdit = computed(() => effectiveRole.value === 'owner' || effectiveRole.value === 'co_organizer')

const showInviteModal = ref(false)
const showArchiveModal = ref(false)

const formattedDate = computed(() => {
  const date = props.event.eventDate || props.event.createdAt
  return new Date(date).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const isPaidEvent = computed(() => props.event.tier && props.event.tier !== 'free')

// Completion indicator for owners
const completionPercent = computed(() => {
  if (!props.isOwner) return null
  const e = props.event
  let filled = 0
  let total = 4
  if (e.title) filled++
  if (e.eventDate) filled++
  if (e.location) filled++
  if (e.invitationCount > 0) filled++
  return Math.round((filled / total) * 100)
})
const completionColor = computed(() => {
  const p = completionPercent.value
  if (p === null) return ''
  if (p >= 100) return 'var(--color-success)'
  if (p >= 50) return 'var(--color-warning, #f59e0b)'
  return 'var(--color-error)'
})

const dropdownItems = computed(() => {
  const group1 = []
  const group2 = []

  if (canEdit.value) {
    group1.push({
      label: t('dashboard.editEvent'),
      icon: 'i-lucide-pencil',
      to: `/dashboard/events/${props.event.id}`,
    })
    group1.push({
      label: t('dashboard.inviteByEmail'),
      icon: 'i-lucide-mail',
      onSelect() { showInviteModal.value = true },
    })
  }

  if (effectiveRole.value === 'owner') {
    group1.push({
      label: t('dashboard.eventEditor.duplicateEvent'),
      icon: 'i-lucide-copy',
      onSelect() { emit('duplicate', props.event) },
    })
    group2.push({
      label: t('dashboard.eventEditor.archiveEvent'),
      icon: 'i-lucide-archive',
      color: 'error',
      onSelect() { showArchiveModal.value = true },
    })
  }

  const items = [group1]
  if (group2.length) items.push(group2)
  return items
})

function onInvited() {
  showInviteModal.value = false
  emit('invited')
}

function onArchiveConfirm() {
  showArchiveModal.value = false
  emit('archive', props.event)
}
</script>

<template>
  <div class="event-card">
    <NuxtLink :to="`/dashboard/events/${event.id}`" class="event-card__link">
      <img
        v-if="event.coverImageUrl"
        :src="event.coverImageUrl"
        alt=""
        class="event-card__cover"
      />

      <div class="event-card__body">
        <div class="event-card__title-row">
          <h3 class="event-card__title">{{ event.title }}</h3>
          <TierBadge v-if="isPaidEvent" :tier="event.tier" />
        </div>
        <div class="event-card__meta">
          <span class="event-card__date">{{ formattedDate }}</span>
          <span v-if="canEdit && event.invitationCount" class="event-card__guests">
            <Icon name="lucide:users" size="12" />
            {{ event.invitationCount }} {{ t('dashboard.invited') }}
          </span>
        </div>
        <!-- Completion bar -->
        <div v-if="completionPercent !== null && completionPercent < 100" class="event-card__completion" :title="t('dashboard.eventCard.completionHint')">
          <div class="event-card__completion-bar">
            <div class="event-card__completion-fill" :style="{ width: completionPercent + '%', background: completionColor }" />
          </div>
        </div>
      </div>
    </NuxtLink>

    <!-- Hover-reveal dropdown menu -->
    <div v-if="canEdit && dropdownItems.length" class="event-card__menu" @click.stop.prevent>
      <AppDropdownMenu :items="dropdownItems">
        <button class="event-card__menu-btn" :title="t('dashboard.editEvent')">
          <Icon name="lucide:more-horizontal" size="16" />
        </button>
      </AppDropdownMenu>
    </div>

    <!-- Invite modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showInviteModal" class="invite-overlay" @click.self="showInviteModal = false">
          <div class="invite-modal">
            <div class="invite-modal__header">
              <h3 class="invite-modal__title">{{ t('dashboard.inviteByEmail') }}</h3>
              <button class="invite-modal__close" @click="showInviteModal = false">
                <Icon name="lucide:x" size="16" />
              </button>
            </div>
            <InviteForm :event-id="event.id" @invited="onInvited" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Archive confirm modal -->
    <ConfirmModal
      :visible="showArchiveModal"
      :title="t('dashboard.eventEditor.confirmArchiveTitle')"
      :message="t('dashboard.eventEditor.confirmArchiveMessage')"
      :warning="isPaidEvent ? t('dashboard.eventEditor.paidEventWarning') : ''"
      :confirm-label="t('dashboard.eventEditor.archiveEvent')"
      variant="danger"
      @confirm="onArchiveConfirm"
      @close="showArchiveModal = false"
    />
  </div>
</template>

<style scoped>
.event-card {
  position: relative;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.event-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.event-card__link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.event-card__cover {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.event-card__body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.event-card__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-width: 0;
}

.event-card__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary);
  flex: 1;
  min-width: 0;
}

.event-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.event-card__guests {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* Hover-reveal 3-dot menu */
.event-card__menu {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  z-index: 2;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.event-card:hover .event-card__menu {
  opacity: 1;
}

@media (hover: none) {
  .event-card__menu {
    opacity: 1;
  }
}

.event-card__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.event-card__menu-btn:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

/* Invite modal */
.invite-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.invite-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-xl);
}

.invite-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.invite-modal__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.invite-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-md);
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.invite-modal__close:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .invite-modal,
.modal-leave-active .invite-modal {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .invite-modal,
.modal-leave-to .invite-modal {
  transform: scale(0.96);
}

/* Completion bar */
.event-card__completion {
  padding: 0 var(--space-4) var(--space-3);
}

.event-card__completion-bar {
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: var(--color-border-light);
  overflow: hidden;
}

.event-card__completion-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}
</style>
