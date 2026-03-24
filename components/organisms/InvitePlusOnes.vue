<script setup>
const { t } = useI18n()

defineProps({
  plusOneInvites: { type: Array, default: () => [] },
  remainingPlusOnes: { type: Number, default: 0 },
  copiedPlusOneId: { type: [String, Number], default: null },
  plusOneSaving: { type: Boolean, default: false },
  removingPlusOne: { type: [String, Number], default: null },
  invitation: { type: Object, default: null },
})

const emit = defineEmits(['add', 'remove', 'copyLink'])

const showForm = ref(false)
const plusOneName = ref('')
const plusOneEmail = ref('')

function handleAdd() {
  if (!plusOneName.value.trim() || !plusOneEmail.value.trim()) return
  emit('add', plusOneName.value.trim(), plusOneEmail.value.trim())
  plusOneName.value = ''
  plusOneEmail.value = ''
  showForm.value = false
}
</script>

<template>
  <div class="invite-plus-ones">
    <div class="invite-plus-ones__header">
      <h2 class="invite-plus-ones__title">
        <Icon name="lucide:user-plus" size="20" />
        {{ t('invite.plusOnes.title') }}
      </h2>
      <p class="invite-plus-ones__subtitle">
        {{ t('invite.plusOnes.subtitle', { count: invitation?.plusOnes || 0 }) }}
      </p>
    </div>

    <!-- List of plus-ones -->
    <div v-if="plusOneInvites.length > 0" class="invite-plus-ones__list">
      <div
        v-for="po in plusOneInvites"
        :key="po.id"
        class="invite-plus-ones__row"
      >
        <div class="invite-plus-ones__avatar">
          {{ (po.inviteeName || '?').charAt(0).toUpperCase() }}
        </div>
        <div class="invite-plus-ones__info">
          <span class="invite-plus-ones__name">{{ po.inviteeName }}</span>
          <span class="invite-plus-ones__email">{{ po.inviteeEmail }}</span>
        </div>
        <AppBadge
          :label="t(`editor.guests.status.${po.status}`)"
          :variant="po.status === 'accepted' ? 'success' : po.status === 'declined' ? 'error' : 'default'"
        />
        <div class="invite-plus-ones__actions">
          <button
            class="invite-plus-ones__action-btn"
            :title="t('invite.plusOnes.copyLink')"
            @click="$emit('copyLink', po.accessToken, po.id)"
          >
            <Icon :name="copiedPlusOneId === po.id ? 'lucide:check' : 'lucide:link'" size="14" />
          </button>
          <button
            class="invite-plus-ones__action-btn invite-plus-ones__action-btn--danger"
            :title="t('invite.plusOnes.remove')"
            :disabled="removingPlusOne === po.id"
            @click="$emit('remove', po.id)"
          >
            <Icon :name="removingPlusOne === po.id ? 'lucide:loader-2' : 'lucide:x'" size="14" :class="{ 'spin': removingPlusOne === po.id }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add form -->
    <Transition name="expand">
      <div v-if="remainingPlusOnes > 0 && showForm" class="invite-plus-ones__form">
        <input
          v-model="plusOneName"
          type="text"
          class="invite-plus-ones__input"
          :placeholder="t('invite.plusOnes.namePlaceholder')"
        />
        <input
          v-model="plusOneEmail"
          type="email"
          class="invite-plus-ones__input"
          :placeholder="t('invite.plusOnes.emailPlaceholder')"
        />
        <div class="invite-plus-ones__form-actions">
          <AppButton
            variant="primary"
            size="sm"
            :loading="plusOneSaving"
            :disabled="!plusOneName.trim() || !plusOneEmail.trim()"
            @click="handleAdd"
          >
            <Icon name="lucide:link" size="14" />
            {{ t('invite.plusOnes.createLink') }}
          </AppButton>
          <AppButton variant="ghost" size="sm" @click="showForm = false">
            {{ t('common.cancel') }}
          </AppButton>
        </div>
      </div>
    </Transition>

    <!-- Add button -->
    <AppButton
      v-if="remainingPlusOnes > 0 && !showForm"
      variant="outline"
      size="sm"
      @click="showForm = true"
    >
      <Icon name="lucide:user-plus" size="14" />
      {{ t('invite.plusOnes.addButton') }}
      <span class="invite-plus-ones__remaining">({{ remainingPlusOnes }} {{ t('invite.plusOnes.remaining') }})</span>
    </AppButton>
  </div>
</template>

<style scoped>
.spin {
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.invite-plus-ones {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.invite-plus-ones__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.invite-plus-ones__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.invite-plus-ones__subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* List */
.invite-plus-ones__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.invite-plus-ones__row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.invite-plus-ones__avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent-violet) 10%, transparent);
  color: var(--color-accent-violet);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.invite-plus-ones__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.invite-plus-ones__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.invite-plus-ones__email {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invite-plus-ones__actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.invite-plus-ones__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.invite-plus-ones__action-btn:hover {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}

.invite-plus-ones__action-btn--danger:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}

/* Form */
.invite-plus-ones__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 2%, var(--color-surface));
}

.invite-plus-ones__input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  outline: none;
  transition: border-color var(--transition-fast);
}

.invite-plus-ones__input:focus {
  border-color: var(--event-accent, var(--color-accent));
}

.invite-plus-ones__form-actions {
  display: flex;
  gap: var(--space-2);
}

.invite-plus-ones__remaining {
  font-weight: var(--font-weight-normal);
  opacity: 0.6;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 300ms ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
}
</style>
