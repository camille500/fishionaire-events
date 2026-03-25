<script setup>
const { t } = useI18n()
const toast = useToast()

const props = defineProps({
  eventId: { type: Number, required: true },
})

const guests = ref([])
const stats = ref({ invited: 0, plusOnes: 0, total: 0, accepted: 0, declined: 0, pending: 0 })
const subEvents = ref([])
const loading = ref(false)
const saving = ref(false)
const copySuccess = ref(false)
const showAddForm = ref(false)
const showBulkForm = ref(false)
const bulkSaving = ref(false)

// Search & filter
const searchQuery = ref('')
const debouncedSearch = ref('')
const statusFilter = ref('all')
let searchTimer = null

watch(searchQuery, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { debouncedSearch.value = val }, 200)
})

const existingEmails = computed(() => {
  return new Set(guests.value.map((g) => g.inviteeEmail?.toLowerCase()))
})

const filteredGuests = computed(() => {
  let result = guests.value

  if (statusFilter.value !== 'all') {
    result = result.filter((g) => g.status === statusFilter.value)
  }

  const q = debouncedSearch.value.trim().toLowerCase()
  if (q) {
    result = result.filter((g) => {
      const name = (g.inviteeName || '').toLowerCase()
      const email = (g.inviteeEmail || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }

  return result
})

// Virtual scrolling
const listContainer = ref(null)
const scrollTop = ref(0)
const ITEM_HEIGHT = 64
const OVERSCAN = 5

function handleScroll() {
  if (listContainer.value) {
    scrollTop.value = listContainer.value.scrollTop
  }
}

const useVirtual = computed(() => filteredGuests.value.length > 50)

const virtualState = computed(() => {
  if (!useVirtual.value) return null
  const containerHeight = 480
  const totalHeight = filteredGuests.value.length * ITEM_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(
    filteredGuests.value.length,
    Math.ceil((scrollTop.value + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  )
  return {
    totalHeight,
    startIndex,
    endIndex,
    offsetY: startIndex * ITEM_HEIGHT,
    visibleItems: filteredGuests.value.slice(startIndex, endIndex),
  }
})

// Add guest form
const newName = ref('')
const newEmail = ref('')
const newPlusOnes = ref(0)
const selectedSubEventIds = ref([])

// Fetch data
async function fetchGuests() {
  loading.value = true
  try {
    const data = await $fetch(`/api/events/${props.eventId}/guests`)
    guests.value = data.guests
    stats.value = data.stats
  } catch {
    guests.value = []
  } finally {
    loading.value = false
  }
}

async function fetchSubEvents() {
  try {
    const data = await $fetch(`/api/events/${props.eventId}/sub-events`)
    subEvents.value = data
  } catch {
    subEvents.value = []
  }
}

onMounted(() => {
  fetchGuests()
  fetchSubEvents()
})

// Add guest
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function addGuest() {
  if (!isValidEmail(newEmail.value)) return

  saving.value = true
  try {
    const subEventInvites = selectedSubEventIds.value.length > 0 && selectedSubEventIds.value.length < subEvents.value.length
      ? selectedSubEventIds.value.map((id) => ({ subEventId: id, plusOnes: 0 }))
      : []

    await $fetch(`/api/events/${props.eventId}/guests`, {
      method: 'POST',
      body: {
        email: newEmail.value.trim(),
        name: newName.value.trim() || undefined,
        plusOnes: newPlusOnes.value,
        subEventInvites,
      },
    })
    newName.value = ''
    newEmail.value = ''
    newPlusOnes.value = 0
    selectedSubEventIds.value = []
    showAddForm.value = false
    await fetchGuests()
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function bulkAddGuests(payload) {
  bulkSaving.value = true
  try {
    const result = await $fetch(`/api/events/${props.eventId}/guests/bulk`, {
      method: 'POST',
      body: payload,
    })
    const messages = []
    if (result.created?.length) messages.push(t('editor.guests.bulkResultCreated', result.created.length))
    if (result.duplicates?.length) messages.push(t('editor.guests.bulkResultDuplicates', result.duplicates.length))
    if (result.invalid?.length) messages.push(t('editor.guests.bulkResultInvalid', result.invalid.length))
    toast.add({ title: messages.join(', '), icon: 'i-lucide-check', color: 'green' })
    showBulkForm.value = false
    await fetchGuests()
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    bulkSaving.value = false
  }
}

async function updateGuest(invitationId, data) {
  try {
    await $fetch(`/api/events/${props.eventId}/guests/${invitationId}`, {
      method: 'PUT',
      body: data,
    })
    await fetchGuests()
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}

async function removeGuest(invitationId) {
  try {
    await $fetch(`/api/events/${props.eventId}/guests/${invitationId}`, { method: 'DELETE' })
    await fetchGuests()
    toast.add({ title: t('toast.guestRemoved'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}

// Email sending
const sendingAll = ref(false)

const unsentCount = computed(() => {
  return guests.value.filter((g) => !g.emailSentAt && !g.invitedById).length
})

async function sendInviteEmail(invitationId) {
  try {
    await $fetch(`/api/events/${props.eventId}/guests/${invitationId}/send-email`, { method: 'POST' })
    toast.add({ title: t('toast.emailSent'), icon: 'i-lucide-check', color: 'green' })
    await fetchGuests()
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  }
}

async function sendAllEmails() {
  sendingAll.value = true
  try {
    const result = await $fetch(`/api/events/${props.eventId}/guests/send-all-emails`, { method: 'POST' })
    toast.add({ title: t('toast.emailsSent'), icon: 'i-lucide-check', color: 'green' })
    await fetchGuests()
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    sendingAll.value = false
  }
}

// Share link
const shareLink = computed(() => {
  if (typeof window === 'undefined') return ''
  const eventData = inject('eventEditor', null)
  const shareToken = eventData?.eventData?.value?.shareToken
  return shareToken ? `${window.location.origin}/event/${shareToken}` : ''
})

async function copyShareLink() {
  if (!shareLink.value) return
  try {
    await navigator.clipboard.writeText(shareLink.value)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch {}
}

function toggleSubEvent(id) {
  const idx = selectedSubEventIds.value.indexOf(id)
  if (idx > -1) {
    selectedSubEventIds.value.splice(idx, 1)
  } else {
    selectedSubEventIds.value.push(id)
  }
}
</script>

<template>
  <div class="guest-manager">
    <!-- Summary bar -->
    <div v-if="guests.length > 0" class="guest-manager__summary">
      <div class="guest-manager__stat">
        <Icon name="lucide:users" size="14" />
        <span>{{ stats.total }} {{ t('editor.guests.totalGuests') }}</span>
      </div>
      <div class="guest-manager__stat-details">
        <span v-if="stats.accepted > 0" class="guest-manager__stat-item guest-manager__stat-item--success">
          {{ stats.accepted }} {{ t('editor.guests.status.accepted') }}
        </span>
        <span v-if="stats.declined > 0" class="guest-manager__stat-item guest-manager__stat-item--error">
          {{ stats.declined }} {{ t('editor.guests.status.declined') }}
        </span>
        <span v-if="stats.pending > 0" class="guest-manager__stat-item guest-manager__stat-item--muted">
          {{ stats.pending }} {{ t('editor.guests.status.pending') }}
        </span>
        <span v-if="stats.plusOnes > 0" class="guest-manager__stat-item">
          +{{ stats.plusOnes }} {{ t('editor.guests.plusOnesLabel') }}
        </span>
      </div>
    </div>

    <!-- Search & filter -->
    <div v-if="guests.length > 10" class="guest-manager__search">
      <AppInput
        v-model="searchQuery"
        type="text"
        :placeholder="t('editor.guests.searchPlaceholder')"
        size="sm"
        icon="lucide:search"
        class="guest-manager__search-input"
      />
      <div class="guest-manager__filters">
        <button
          class="guest-manager__filter-pill"
          :class="{ 'guest-manager__filter-pill--active': statusFilter === 'all' }"
          @click="statusFilter = 'all'"
        >
          {{ t('editor.guests.filterAll') }}
        </button>
        <button
          class="guest-manager__filter-pill guest-manager__filter-pill--success"
          :class="{ 'guest-manager__filter-pill--active': statusFilter === 'accepted' }"
          @click="statusFilter = 'accepted'"
        >
          {{ t('editor.guests.status.accepted') }}
        </button>
        <button
          class="guest-manager__filter-pill guest-manager__filter-pill--error"
          :class="{ 'guest-manager__filter-pill--active': statusFilter === 'declined' }"
          @click="statusFilter = 'declined'"
        >
          {{ t('editor.guests.status.declined') }}
        </button>
        <button
          class="guest-manager__filter-pill"
          :class="{ 'guest-manager__filter-pill--active': statusFilter === 'pending' }"
          @click="statusFilter = 'pending'"
        >
          {{ t('editor.guests.status.pending') }}
        </button>
      </div>
    </div>

    <!-- Guest list -->
    <div v-if="loading" class="guest-manager__loading">
      <SkeletonLoader height="56px" />
      <SkeletonLoader height="56px" />
    </div>

    <div v-else-if="guests.length === 0 && !showAddForm && !showBulkForm" class="guest-manager__empty">
      <div class="guest-manager__empty-icon">
        <Icon name="lucide:user-plus" size="24" />
      </div>
      <AppText size="sm" muted>{{ t('editor.guests.noGuests') }}</AppText>
    </div>

    <div v-else-if="guests.length > 0 && filteredGuests.length === 0" class="guest-manager__empty">
      <AppText size="sm" muted>{{ t('editor.guests.noSearchResults') }}</AppText>
    </div>

    <!-- Virtual scrolling for large lists -->
    <div
      v-else-if="useVirtual"
      ref="listContainer"
      class="guest-manager__list guest-manager__list--virtual"
      @scroll="handleScroll"
    >
      <div :style="{ height: virtualState.totalHeight + 'px', position: 'relative' }">
        <div :style="{ transform: 'translateY(' + virtualState.offsetY + 'px)' }">
          <GuestRow
            v-for="guest in virtualState.visibleItems"
            :key="guest.id"
            :invitation="guest"
            :sub-events="subEvents"
            @update="updateGuest"
            @remove="removeGuest"
            @send-email="sendInviteEmail"
          />
        </div>
      </div>
    </div>

    <!-- Normal list for smaller guest counts -->
    <TransitionGroup v-else name="guest-list" tag="div" class="guest-manager__list">
      <GuestRow
        v-for="guest in filteredGuests"
        :key="guest.id"
        :invitation="guest"
        :sub-events="subEvents"
        @update="updateGuest"
        @remove="removeGuest"
        @send-email="sendInviteEmail"
      />
    </TransitionGroup>

    <!-- Add guest form -->
    <div v-if="showAddForm" class="guest-manager__add-form">
      <div class="guest-manager__add-row">
        <AppInput
          v-model="newName"
          type="text"
          :placeholder="t('editor.guests.namePlaceholder')"
          size="sm"
          icon="lucide:user"
          class="guest-manager__add-input"
        />
        <AppInput
          v-model="newEmail"
          type="email"
          :placeholder="t('editor.guests.emailPlaceholder')"
          size="sm"
          icon="lucide:mail"
          class="guest-manager__add-input guest-manager__add-input--email"
        />
      </div>

      <div class="guest-manager__add-row">
        <div class="guest-manager__plus-ones">
          <label class="guest-manager__field-label">{{ t('editor.guests.plusOnesLabel') }}</label>
          <div class="guest-manager__stepper">
            <button type="button" class="guest-manager__stepper-btn" :disabled="newPlusOnes <= 0" @click="newPlusOnes--">
              <Icon name="lucide:minus" size="12" />
            </button>
            <span class="guest-manager__stepper-value">{{ newPlusOnes }}</span>
            <button type="button" class="guest-manager__stepper-btn" @click="newPlusOnes++">
              <Icon name="lucide:plus" size="12" />
            </button>
          </div>
        </div>
      </div>

      <!-- Sub-event checkboxes -->
      <div v-if="subEvents.length > 0" class="guest-manager__sub-events">
        <label class="guest-manager__field-label">{{ t('editor.guests.inviteTo') }}</label>
        <div class="guest-manager__sub-event-checks">
          <label
            v-for="se in subEvents"
            :key="se.id"
            class="guest-manager__check-item"
            :class="{ 'guest-manager__check-item--checked': selectedSubEventIds.includes(se.id) }"
          >
            <input
              type="checkbox"
              :checked="selectedSubEventIds.includes(se.id)"
              class="guest-manager__checkbox"
              @change="toggleSubEvent(se.id)"
            />
            <SubEventTypeIcon :type="se.type || 'generic'" size="xs" />
            <span>{{ se.title }}</span>
          </label>
        </div>
        <div v-if="selectedSubEventIds.length > 0" class="guest-manager__sub-event-notes">
          <template v-for="se in subEvents" :key="'note-' + se.id">
            <div v-if="selectedSubEventIds.includes(se.id) && se.type === 'dinner'" class="guest-manager__sub-event-note">
              <Icon name="lucide:utensils" size="11" />
              {{ t('editor.guests.dietaryNote') }}
            </div>
            <div v-if="selectedSubEventIds.includes(se.id) && se.type === 'party' && se.typeConfig?.musicRequestsEnabled !== false" class="guest-manager__sub-event-note">
              <Icon name="lucide:music" size="11" />
              {{ t('editor.guests.musicNote') }}
            </div>
          </template>
        </div>
        <AppText size="xs" muted>{{ t('editor.guests.leaveEmptyForAll') }}</AppText>
      </div>

      <div class="guest-manager__add-actions">
        <AppButton variant="primary" size="sm" :loading="saving" :disabled="!newEmail.trim()" @click="addGuest">
          <Icon name="lucide:user-plus" size="14" />
          {{ t('editor.guests.addGuest') }}
        </AppButton>
        <AppButton variant="ghost" size="sm" @click="showAddForm = false">
          {{ t('common.cancel') }}
        </AppButton>
      </div>
    </div>

    <!-- Bulk import form -->
    <BulkGuestImport
      v-if="showBulkForm"
      :sub-events="subEvents"
      :existing-emails="existingEmails"
      :saving="bulkSaving"
      @submit="bulkAddGuests"
      @cancel="showBulkForm = false"
    />

    <!-- Action buttons -->
    <div class="guest-manager__footer">
      <AppButton
        v-if="!showAddForm && !showBulkForm"
        variant="outline"
        size="sm"
        @click="showAddForm = true; showBulkForm = false"
      >
        <Icon name="lucide:user-plus" size="14" />
        {{ t('editor.guests.addGuest') }}
      </AppButton>

      <AppButton
        v-if="!showAddForm && !showBulkForm"
        variant="outline"
        size="sm"
        @click="showBulkForm = true; showAddForm = false"
      >
        <Icon name="lucide:users" size="14" />
        {{ t('editor.guests.bulkAdd') }}
      </AppButton>

      <AppButton
        v-if="unsentCount > 0"
        variant="primary"
        size="sm"
        :loading="sendingAll"
        @click="sendAllEmails"
      >
        <Icon name="lucide:send" size="14" />
        {{ t('editor.guests.sendAll') }}
        <span class="guest-manager__unsent-badge">{{ unsentCount }}</span>
      </AppButton>

      <AppButton
        v-if="shareLink"
        variant="ghost"
        size="sm"
        @click="copyShareLink"
      >
        <Icon :name="copySuccess ? 'lucide:check' : 'lucide:share-2'" size="14" />
        {{ copySuccess ? t('editor.guests.linkCopied') : t('editor.guests.copyShareLink') }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.guest-manager {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.guest-manager__summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  background: var(--color-accent-dim);
  border-radius: var(--radius-lg);
}

.guest-manager__stat {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.guest-manager__stat-details {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.guest-manager__stat-item {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.guest-manager__stat-item--success {
  color: var(--color-success);
}

.guest-manager__stat-item--error {
  color: var(--color-error);
}

.guest-manager__loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.guest-manager__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-4);
  border: 1.5px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
  text-align: center;
}

.guest-manager__empty-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.guest-manager__search {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.guest-manager__search-input {
  max-width: 320px;
}

.guest-manager__filters {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.guest-manager__filter-pill {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  background: transparent;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.guest-manager__filter-pill:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.guest-manager__filter-pill--active {
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

.guest-manager__filter-pill--success.guest-manager__filter-pill--active {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  color: var(--color-success);
}

.guest-manager__filter-pill--error.guest-manager__filter-pill--active {
  border-color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
  color: var(--color-error);
}

.guest-manager__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.guest-manager__list--virtual {
  max-height: 480px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.guest-manager__add-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.guest-manager__add-row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.guest-manager__add-input {
  flex: 1;
  min-width: 140px;
}

.guest-manager__add-input--email {
  flex: 1.5;
}

.guest-manager__plus-ones {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.guest-manager__field-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.guest-manager__stepper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
}

.guest-manager__stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.guest-manager__stepper-btn:hover:not(:disabled) {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}

.guest-manager__stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.guest-manager__stepper-value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  min-width: 20px;
  text-align: center;
}

.guest-manager__sub-events {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.guest-manager__sub-event-checks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.guest-manager__check-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.guest-manager__check-item:hover {
  border-color: var(--color-accent);
}

.guest-manager__check-item--checked {
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

.guest-manager__checkbox {
  display: none;
}

.guest-manager__sub-event-notes {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.guest-manager__sub-event-note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 10px;
  color: var(--color-text-muted);
  padding-left: var(--space-1);
}

.guest-manager__add-actions {
  display: flex;
  gap: var(--space-2);
}

.guest-manager__footer {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.guest-manager__unsent-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.25);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
}

/* Transitions */
.guest-list-enter-active {
  transition: all 300ms ease-out;
}

.guest-list-leave-active {
  transition: all 200ms ease-in;
}

.guest-list-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.guest-list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (max-width: 640px) {
  .guest-manager__add-row {
    flex-direction: column;
  }
}
</style>
