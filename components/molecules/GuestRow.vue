<script setup>
const { t } = useI18n()

const props = defineProps({
  invitation: { type: Object, required: true },
  subEvents: { type: Array, default: () => [] },
})

const emit = defineEmits(['remove', 'update', 'send-email'])

const copySuccess = ref(false)
const sendingEmail = ref(false)
const editing = ref(false)
const editName = ref('')
const editEmail = ref('')
const editPlusOnes = ref(0)

const initials = computed(() => {
  const name = props.invitation.inviteeName || props.invitation.inviteeEmail
  return name.charAt(0).toUpperCase()
})

const statusVariant = computed(() => {
  const map = { accepted: 'success', declined: 'error', pending: 'default' }
  return map[props.invitation.status] || 'default'
})

const statusLabel = computed(() => {
  return t(`editor.guests.status.${props.invitation.status}`)
})

const invitedSubEventNames = computed(() => {
  if (!props.invitation.subEventInvites?.length) return null
  const ids = props.invitation.subEventInvites.map((s) => s.subEventId)
  return props.subEvents
    .filter((se) => ids.includes(se.id))
    .map((se) => se.title)
})

const inviteLink = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/invite/${props.invitation.accessToken}`
})

const plusOneInvites = computed(() => props.invitation.plusOneInvites || [])
const showPlusOnes = ref(false)

function startEdit() {
  editName.value = props.invitation.inviteeName || ''
  editEmail.value = props.invitation.inviteeEmail || ''
  editPlusOnes.value = props.invitation.plusOnes || 0
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function saveEdit() {
  emit('update', props.invitation.id, {
    inviteeName: editName.value.trim() || null,
    plusOnes: editPlusOnes.value,
  })
  editing.value = false
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch {}
}

async function handleSendEmail() {
  sendingEmail.value = true
  emit('send-email', props.invitation.id)
  // Parent will handle the actual API call and reset state
  setTimeout(() => { sendingEmail.value = false }, 3000)
}
</script>

<template>
  <div class="guest-row-wrapper">
    <!-- Main guest row -->
    <div class="guest-row" :class="{ 'guest-row--editing': editing }">
      <div class="guest-row__avatar">{{ initials }}</div>

      <!-- View mode -->
      <div v-if="!editing" class="guest-row__info">
        <div class="guest-row__name-line">
          <span class="guest-row__name">{{ invitation.inviteeName || invitation.inviteeEmail }}</span>
          <AppBadge :variant="statusVariant" size="sm" :label="statusLabel" />
        </div>
        <span v-if="invitation.inviteeName" class="guest-row__email">{{ invitation.inviteeEmail }}</span>
        <div class="guest-row__meta">
          <button
            v-if="invitation.plusOnes > 0"
            class="guest-row__plus-ones"
            :class="{ 'guest-row__plus-ones--clickable': plusOneInvites.length > 0 }"
            @click="plusOneInvites.length > 0 ? showPlusOnes = !showPlusOnes : null"
          >
            <Icon name="lucide:user-plus" size="12" />
            +{{ invitation.plusOnes }}
            <span v-if="plusOneInvites.length > 0" class="guest-row__plus-ones-filled">
              ({{ plusOneInvites.length }}/{{ invitation.plusOnes }} {{ t('editor.guests.plusOnesFilled') }})
            </span>
            <Icon
              v-if="plusOneInvites.length > 0"
              :name="showPlusOnes ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              size="10"
              class="guest-row__plus-ones-toggle"
            />
          </button>
          <template v-if="invitedSubEventNames">
            <span
              v-for="name in invitedSubEventNames"
              :key="name"
              class="guest-row__sub-event-chip"
            >{{ name }}</span>
          </template>
          <span v-else-if="subEvents.length > 0" class="guest-row__all-events">
            {{ t('editor.guests.allSubEvents') }}
          </span>
        </div>
      </div>

      <!-- Edit mode -->
      <div v-else class="guest-row__edit-form">
        <div class="guest-row__edit-row">
          <input
            v-model="editName"
            type="text"
            class="guest-row__edit-input"
            :placeholder="t('editor.guests.namePlaceholder')"
          />
          <input
            v-model="editEmail"
            type="email"
            class="guest-row__edit-input"
            :placeholder="t('editor.guests.emailPlaceholder')"
            disabled
          />
        </div>
        <div class="guest-row__edit-row">
          <div class="guest-row__plus-ones-edit">
            <label class="guest-row__edit-label">{{ t('editor.guests.plusOnesLabel') }}</label>
            <div class="guest-row__stepper">
              <button type="button" class="guest-row__stepper-btn" :disabled="editPlusOnes <= 0" @click="editPlusOnes--">
                <Icon name="lucide:minus" size="12" />
              </button>
              <span class="guest-row__stepper-value">{{ editPlusOnes }}</span>
              <button type="button" class="guest-row__stepper-btn" @click="editPlusOnes++">
                <Icon name="lucide:plus" size="12" />
              </button>
            </div>
          </div>
          <div class="guest-row__edit-actions">
            <AppButton variant="primary" size="sm" @click="saveEdit">{{ t('common.save') }}</AppButton>
            <AppButton variant="ghost" size="sm" @click="cancelEdit">{{ t('common.cancel') }}</AppButton>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="!editing" class="guest-row__actions">
        <span v-if="invitation.emailSentAt" class="guest-row__sent-badge" :title="t('editor.guests.emailSent')">
          <Icon name="lucide:mail-check" size="12" />
        </span>
        <button
          class="guest-row__action-btn guest-row__action-btn--send"
          :title="invitation.emailSentAt ? t('editor.guests.resendInvite') : t('editor.guests.sendInvite')"
          :disabled="sendingEmail"
          @click="handleSendEmail"
        >
          <Icon :name="sendingEmail ? 'lucide:loader' : 'lucide:send'" size="14" :class="{ 'guest-row__spin': sendingEmail }" />
        </button>
        <button class="guest-row__action-btn" :title="t('editor.guests.editGuest')" @click="startEdit">
          <Icon name="lucide:pencil" size="14" />
        </button>
        <button class="guest-row__action-btn" :title="t('editor.guests.copyInviteLink')" @click="copyLink">
          <Icon :name="copySuccess ? 'lucide:check' : 'lucide:link'" size="14" />
        </button>
        <a
          class="guest-row__action-btn"
          :href="`https://wa.me/?text=${encodeURIComponent(t('editor.guests.whatsappMessage', { link: inviteLink }))}`"
          target="_blank"
          :title="t('editor.guests.shareWhatsApp')"
        >
          <Icon name="lucide:message-circle" size="14" />
        </a>
        <button class="guest-row__action-btn guest-row__action-btn--danger" :title="t('editor.guests.removeGuest')" @click="emit('remove', invitation.id)">
          <Icon name="lucide:x" size="14" />
        </button>
      </div>
    </div>

    <!-- Nested plus-one invites (collapsed by default) -->
    <Transition name="plus-ones-slide">
      <div v-if="showPlusOnes && plusOneInvites.length > 0" class="guest-row__plus-one-list">
        <div
          v-for="po in plusOneInvites"
          :key="po.id"
          class="guest-row__plus-one"
        >
          <div class="guest-row__plus-one-connector" />
          <div class="guest-row__plus-one-avatar">
            {{ (po.inviteeName || po.inviteeEmail || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="guest-row__plus-one-info">
            <span class="guest-row__plus-one-name">{{ po.inviteeName || po.inviteeEmail }}</span>
            <span v-if="po.inviteeName" class="guest-row__plus-one-email">{{ po.inviteeEmail }}</span>
          </div>
          <AppBadge :variant="po.status === 'accepted' ? 'success' : po.status === 'declined' ? 'error' : 'default'" size="sm" :label="t(`editor.guests.status.${po.status}`)" />
          <span class="guest-row__plus-one-label">+1</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.guest-row-wrapper {
  display: flex;
  flex-direction: column;
  contain: layout style;
}

.guest-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition: all var(--transition-fast);
}

.guest-row:hover {
  border-color: var(--color-border);
}

.guest-row--editing {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 2%, var(--color-surface));
}

.guest-row__avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.guest-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.guest-row__name-line {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.guest-row__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.guest-row__email {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.guest-row__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.guest-row__plus-ones {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
  border: none;
  background: none;
  padding: 0;
  cursor: default;
  font-family: inherit;
}

.guest-row__plus-ones--clickable {
  cursor: pointer;
  border-radius: var(--radius-sm);
  padding: 1px var(--space-1);
  margin: -1px calc(-1 * var(--space-1));
  transition: background var(--transition-fast);
}

.guest-row__plus-ones--clickable:hover {
  background: var(--color-accent-dim);
}

.guest-row__plus-ones-toggle {
  opacity: 0.6;
  transition: transform var(--transition-fast);
}

.guest-row__plus-ones-filled {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-normal);
}

.guest-row__sub-event-chip {
  display: inline-block;
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-size: 0.625rem;
  font-weight: var(--font-weight-medium);
}

.guest-row__all-events {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

/* Edit mode */
.guest-row__edit-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.guest-row__edit-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.guest-row__edit-input {
  flex: 1;
  min-width: 120px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg, var(--color-background));
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  outline: none;
  transition: border-color var(--transition-fast);
}

.guest-row__edit-input:focus {
  border-color: var(--color-accent);
}

.guest-row__edit-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.guest-row__plus-ones-edit {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.guest-row__edit-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.guest-row__stepper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
}

.guest-row__stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.guest-row__stepper-btn:hover:not(:disabled) {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}

.guest-row__stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.guest-row__stepper-value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  min-width: 16px;
  text-align: center;
}

.guest-row__edit-actions {
  display: flex;
  gap: var(--space-2);
  margin-left: auto;
}

/* Actions */
.guest-row__actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.guest-row__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.guest-row__action-btn:hover {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}

.guest-row__action-btn--danger:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}

.guest-row__action-btn--send:hover {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
}

.guest-row__sent-badge {
  display: flex;
  align-items: center;
  color: var(--color-success);
  font-size: var(--text-xs);
}

.guest-row__spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Plus-one nested list */
.guest-row__plus-one-list {
  display: flex;
  flex-direction: column;
  margin-left: var(--space-8);
  padding-left: var(--space-4);
  border-left: 2px solid var(--color-border-light);
}

.guest-row__plus-one {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  position: relative;
}

.guest-row__plus-one-connector {
  position: absolute;
  left: calc(-1 * var(--space-4) - 1px);
  top: 50%;
  width: var(--space-4);
  height: 1px;
  background: var(--color-border-light);
}

.guest-row__plus-one-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent-violet) 10%, transparent);
  color: var(--color-accent-violet);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.guest-row__plus-one-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.guest-row__plus-one-name {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.guest-row__plus-one-email {
  font-size: 0.625rem;
  color: var(--color-text-muted);
}

.guest-row__plus-one-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent-violet);
  background: color-mix(in srgb, var(--color-accent-violet) 8%, transparent);
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
}

/* Plus-one collapse transition */
.plus-ones-slide-enter-active {
  transition: all 200ms ease-out;
  overflow: hidden;
}

.plus-ones-slide-leave-active {
  transition: all 150ms ease-in;
  overflow: hidden;
}

.plus-ones-slide-enter-from,
.plus-ones-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.plus-ones-slide-enter-to,
.plus-ones-slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

@media (max-width: 640px) {
  .guest-row {
    flex-wrap: wrap;
  }

  .guest-row__actions {
    margin-left: auto;
  }

  .guest-row__edit-row {
    flex-direction: column;
    align-items: stretch;
  }

  .guest-row__edit-actions {
    margin-left: 0;
  }

  .guest-row__plus-one-list {
    margin-left: var(--space-6);
  }
}
</style>
