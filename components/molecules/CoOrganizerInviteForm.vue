<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['invited'])

const { results, loading, isOpen, onInput, selectResult, close, clear } = useUserSearch()

const query = ref('')
const highlightedIndex = ref(-1)
const submitting = ref(false)
const success = ref(false)
const error = ref('')

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function onInputChange(e) {
  const value = e.target.value
  query.value = value
  onInput(value)
  highlightedIndex.value = -1
  error.value = ''
}

function onFocus() {
  if (results.value.length > 0 || (query.value.length >= 2)) {
    isOpen.value = true
  }
}

function onKeydown(e) {
  const totalOptions = results.value.length + (results.value.length === 0 && isValidEmail(query.value) ? 1 : 0)
  if (!isOpen.value || totalOptions === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, totalOptions - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (highlightedIndex.value >= 0 && highlightedIndex.value < results.value.length) {
      onSelectUser(results.value[highlightedIndex.value])
    } else if (results.value.length === 0 && isValidEmail(query.value)) {
      onSubmitEmail()
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
    highlightedIndex.value = -1
  }
}

async function onSelectUser(user) {
  selectResult(user)
  query.value = ''
  highlightedIndex.value = -1
  submitting.value = true
  error.value = ''
  success.value = false

  try {
    await $fetch(`/api/events/${props.eventId}/co-organizers`, {
      method: 'POST',
      body: { clerkId: user.clerkId },
    })
    success.value = true
    emit('invited')
    setTimeout(() => { success.value = false }, 3000)
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.eventEditor.errorCoOrganizer')
  } finally {
    submitting.value = false
  }
}

async function onSubmitEmail() {
  if (!isValidEmail(query.value)) return

  isOpen.value = false
  highlightedIndex.value = -1
  submitting.value = true
  error.value = ''
  success.value = false

  try {
    await $fetch(`/api/events/${props.eventId}/co-organizers`, {
      method: 'POST',
      body: { email: query.value.trim() },
    })
    success.value = true
    query.value = ''
    clear()
    emit('invited')
    setTimeout(() => { success.value = false }, 3000)
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.eventEditor.errorCoOrganizer')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="co-org-form">
    <div class="co-org-form__search">
      <div class="co-org-form__input-wrapper">
        <Icon name="lucide:search" size="14" class="co-org-form__icon" />
        <input
          type="text"
          class="co-org-form__field"
          :value="query"
          :placeholder="t('dashboard.eventEditor.coOrganizerSearchPlaceholder')"
          :disabled="submitting"
          autocomplete="off"
          @input="onInputChange"
          @keydown="onKeydown"
          @blur="close"
          @focus="onFocus"
        />
        <Icon v-if="loading" name="lucide:loader-2" size="14" class="co-org-form__loader" />
      </div>

      <Transition name="dropdown">
        <div v-if="isOpen && (results.length > 0 || query.length >= 2)" class="co-org-form__dropdown">
          <button
            v-for="(user, index) in results"
            :key="user.clerkId"
            type="button"
            class="co-org-form__result"
            :class="{ 'co-org-form__result--highlighted': index === highlightedIndex }"
            @mousedown.prevent="onSelectUser(user)"
            @mouseover="highlightedIndex = index"
          >
            <AvatarCircle
              :src="user.avatarUrl"
              :name="user.displayName"
              size="sm"
            />
            <div class="co-org-form__result-info">
              <span class="co-org-form__result-name">{{ user.displayName }}</span>
              <span class="co-org-form__result-email">{{ user.email }}</span>
            </div>
            <Icon name="lucide:plus" size="14" class="co-org-form__result-action" />
          </button>

          <div v-if="results.length === 0 && !loading && query.length >= 2" class="co-org-form__empty">
            <AppText size="sm" muted>{{ t('dashboard.eventEditor.coOrganizerNoResults') }}</AppText>
            <button
              v-if="isValidEmail(query)"
              type="button"
              class="co-org-form__result co-org-form__result--email"
              :class="{ 'co-org-form__result--highlighted': highlightedIndex === 0 }"
              @mousedown.prevent="onSubmitEmail"
              @mouseover="highlightedIndex = 0"
            >
              <Icon name="lucide:mail" size="16" class="co-org-form__result-mail-icon" />
              <span class="co-org-form__result-name">
                {{ t('dashboard.eventEditor.coOrganizerAddByEmail', { email: query }) }}
              </span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <AppText v-if="success" size="sm" class="co-org-form__success">
      {{ t('dashboard.eventEditor.coOrganizerInvited') }}
    </AppText>
    <AppText v-if="error" size="sm" class="co-org-form__error">
      {{ error }}
    </AppText>
  </div>
</template>

<style scoped>
.co-org-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.co-org-form__search {
  position: relative;
}

.co-org-form__input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.co-org-form__input-wrapper:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.co-org-form__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
  opacity: 0.5;
}

.co-org-form__field {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
  min-width: 0;
}

.co-org-form__field::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.co-org-form__field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.co-org-form__loader {
  color: var(--color-text-muted);
  flex-shrink: 0;
  animation: spin 1s linear infinite;
}

/* Dropdown */
.co-org-form__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.1));
  max-height: 280px;
  overflow-y: auto;
  padding: var(--space-1) 0;
}

.co-org-form__result {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  text-align: left;
  font-family: var(--font-family);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.co-org-form__result:hover,
.co-org-form__result--highlighted {
  background: var(--color-accent-dim);
}

.co-org-form__result-info {
  flex: 1;
  min-width: 0;
}

.co-org-form__result-name {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.co-org-form__result-email {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.co-org-form__result-action {
  color: var(--color-text-muted);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.co-org-form__result:hover .co-org-form__result-action,
.co-org-form__result--highlighted .co-org-form__result-action {
  opacity: 1;
  color: var(--color-accent);
}

.co-org-form__result--email {
  gap: var(--space-2);
}

.co-org-form__result-mail-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.co-org-form__empty {
  padding: var(--space-2) var(--space-3);
}

.co-org-form__success {
  color: var(--color-success);
}

.co-org-form__error {
  color: var(--color-accent-dark);
}

/* Transition */
.dropdown-enter-active {
  transition: all 150ms ease-out;
}

.dropdown-leave-active {
  transition: all 100ms ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
