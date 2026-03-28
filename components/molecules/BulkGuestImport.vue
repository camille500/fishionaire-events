<script setup>
const { t } = useI18n()

const props = defineProps({
  subEvents: { type: Array, default: () => [] },
  existingEmails: { type: Set, default: () => new Set() },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

// State
const phase = ref('input') // 'input' | 'preview'
const inputMode = ref('paste') // 'paste' | 'csv'
const textInput = ref('')
const parsedGuests = ref([])
const selectedSubEventIds = ref([])
const fileInput = ref(null)
const isDragging = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Parsing
function parseLines(text) {
  // Remove BOM
  const clean = text.replace(/^\uFEFF/, '')
  const lines = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  // Detect header row
  const first = lines[0]?.toLowerCase() || ''
  const startIndex = (first.includes('email') || first.includes('e-mail') || first.includes('naam') || first.includes('name')) ? 1 : 0

  return lines.slice(startIndex).map((line) => {
    // Handle quoted CSV fields
    const parts = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (!inQuotes && (char === ',' || char === ';' || char === '\t')) {
        parts.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    parts.push(current.trim())

    const email = parts.find((p) => p.includes('@')) || parts[0] || ''
    const remaining = parts.filter((p) => p !== email)
    // Last part that is purely numeric is plusOnes
    const lastPart = remaining[remaining.length - 1]
    const parsedPlusOnes = lastPart && /^\d+$/.test(lastPart) ? parseInt(lastPart) : 0
    const nameParts = parsedPlusOnes > 0 || (lastPart && /^\d+$/.test(lastPart))
      ? remaining.slice(0, -1)
      : remaining
    const name = nameParts.filter((p) => p.length > 0).join(' ')

    return {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      plusOnes: parsedPlusOnes,
      id: Math.random().toString(36).slice(2),
    }
  })
}

function handleParse() {
  parsedGuests.value = parseLines(textInput.value)
  phase.value = 'preview'
}

async function handleFileSelect(e) {
  const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0]
  if (!file) return

  const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'

  if (isXlsx) {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    parsedGuests.value = parseLines(csv)
    phase.value = 'preview'
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    parsedGuests.value = parseLines(reader.result)
    phase.value = 'preview'
  }
  reader.readAsText(file)
}

function handleDrop(e) {
  isDragging.value = false
  handleFileSelect(e)
}

// Preview helpers
function guestStatus(guest) {
  if (!emailRegex.test(guest.email)) return 'invalid'
  if (props.existingEmails.has(guest.email)) return 'duplicate'
  return 'valid'
}

const validGuests = computed(() => parsedGuests.value.filter((g) => guestStatus(g) === 'valid'))
const invalidGuests = computed(() => parsedGuests.value.filter((g) => guestStatus(g) === 'invalid'))
const duplicateGuests = computed(() => parsedGuests.value.filter((g) => guestStatus(g) === 'duplicate'))

function removeGuest(id) {
  parsedGuests.value = parsedGuests.value.filter((g) => g.id !== id)
}

function goBack() {
  phase.value = 'input'
}

function updateGuestPlusOnes(id, delta) {
  const guest = parsedGuests.value.find((g) => g.id === id)
  if (guest) guest.plusOnes = Math.max(0, (guest.plusOnes || 0) + delta)
}

function handleSubmit() {
  const guests = validGuests.value.map(({ email, name, plusOnes: po }) => ({
    email,
    name: name || undefined,
    plusOnes: po || 0,
  }))
  const subEventInvites = selectedSubEventIds.value.length > 0 && selectedSubEventIds.value.length < props.subEvents.length
    ? selectedSubEventIds.value.map((id) => ({ subEventId: id, plusOnes: 0 }))
    : []
  emit('submit', { guests, subEventInvites })
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
  <div class="bulk-import">
    <!-- Phase: Input -->
    <template v-if="phase === 'input'">
      <!-- Tab toggle -->
      <div class="bulk-import__tabs">
        <button
          class="bulk-import__tab"
          :class="{ 'bulk-import__tab--active': inputMode === 'paste' }"
          @click="inputMode = 'paste'"
        >
          <Icon name="lucide:clipboard-paste" size="14" />
          {{ t('editor.guests.bulkPaste') }}
        </button>
        <button
          class="bulk-import__tab"
          :class="{ 'bulk-import__tab--active': inputMode === 'csv' }"
          @click="inputMode = 'csv'"
        >
          <Icon name="lucide:file-spreadsheet" size="14" />
          {{ t('editor.guests.bulkUpload') }}
        </button>
      </div>

      <!-- Paste mode -->
      <div v-if="inputMode === 'paste'" class="bulk-import__paste">
        <AppText size="xs" muted class="bulk-import__hint">{{ t('editor.guests.bulkTextareaPlaceholder') }}</AppText>
        <textarea
          v-model="textInput"
          class="bulk-import__textarea"
          placeholder="jan@example.com, Jan de Vries, 2&#10;lisa@example.com, Lisa Bakker&#10;piet@example.com, 1"
          rows="8"
        />
      </div>

      <!-- CSV mode -->
      <div
        v-else
        class="bulk-import__dropzone"
        :class="{ 'bulk-import__dropzone--dragging': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <Icon name="lucide:upload" size="24" />
        <AppText size="sm" muted>{{ t('editor.guests.bulkDropFile') }}</AppText>
        <input
          ref="fileInput"
          type="file"
          accept=".csv,.txt,.tsv,.xlsx,.xls"
          class="bulk-import__file-input"
          @change="handleFileSelect"
        />
      </div>

      <a href="/templates/guest-import-template.csv" download class="bulk-import__template-link">
        <Icon name="lucide:download" size="13" />
        {{ t('editor.guests.downloadTemplate') }}
      </a>

      <!-- Shared options -->
      <div class="bulk-import__options">
        <div v-if="subEvents.length > 0" class="bulk-import__sub-events">
          <label class="bulk-import__label">{{ t('editor.guests.inviteTo') }}</label>
          <div class="bulk-import__sub-event-checks">
            <label
              v-for="se in subEvents"
              :key="se.id"
              class="bulk-import__check-item"
              :class="{ 'bulk-import__check-item--checked': selectedSubEventIds.includes(se.id) }"
            >
              <input
                type="checkbox"
                :checked="selectedSubEventIds.includes(se.id)"
                class="bulk-import__checkbox"
                @change="toggleSubEvent(se.id)"
              />
              <SubEventTypeIcon :type="se.type || 'generic'" size="xs" />
              <span>{{ se.title }}</span>
            </label>
          </div>
          <AppText size="xs" muted>{{ t('editor.guests.leaveEmptyForAll') }}</AppText>
        </div>
      </div>

      <div class="bulk-import__actions">
        <AppButton
          variant="primary"
          size="sm"
          :disabled="inputMode === 'paste' && !textInput.trim()"
          @click="handleParse"
        >
          <Icon name="lucide:eye" size="14" />
          {{ t('editor.guests.bulkPreview') }}
        </AppButton>
        <AppButton variant="ghost" size="sm" @click="emit('cancel')">
          {{ t('common.cancel') }}
        </AppButton>
      </div>
    </template>

    <!-- Phase: Preview -->
    <template v-if="phase === 'preview'">
      <!-- Counts -->
      <div class="bulk-import__counts">
        <span v-if="validGuests.length > 0" class="bulk-import__count bulk-import__count--valid">
          {{ validGuests.length }} {{ t('editor.guests.bulkValid') }}
        </span>
        <span v-if="duplicateGuests.length > 0" class="bulk-import__count bulk-import__count--duplicate">
          {{ duplicateGuests.length }} {{ t('editor.guests.bulkDuplicate') }}
        </span>
        <span v-if="invalidGuests.length > 0" class="bulk-import__count bulk-import__count--invalid">
          {{ invalidGuests.length }} {{ t('editor.guests.bulkInvalid') }}
        </span>
      </div>

      <!-- Preview list -->
      <div class="bulk-import__preview-list">
        <div
          v-for="guest in parsedGuests"
          :key="guest.id"
          class="bulk-import__preview-row"
          :class="'bulk-import__preview-row--' + guestStatus(guest)"
        >
          <div class="bulk-import__preview-status">
            <Icon
              v-if="guestStatus(guest) === 'valid'"
              name="lucide:check-circle"
              size="14"
              class="bulk-import__icon--valid"
            />
            <Icon
              v-else-if="guestStatus(guest) === 'duplicate'"
              name="lucide:copy"
              size="14"
              class="bulk-import__icon--duplicate"
            />
            <Icon
              v-else
              name="lucide:alert-circle"
              size="14"
              class="bulk-import__icon--invalid"
            />
          </div>
          <div class="bulk-import__preview-info">
            <span class="bulk-import__preview-email">{{ guest.email }}</span>
            <span v-if="guest.name" class="bulk-import__preview-name">{{ guest.name }}</span>
          </div>
          <div v-if="guestStatus(guest) === 'valid'" class="bulk-import__stepper bulk-import__stepper--compact">
            <button type="button" class="bulk-import__stepper-btn" :disabled="!guest.plusOnes" @click="updateGuestPlusOnes(guest.id, -1)">
              <Icon name="lucide:minus" size="10" />
            </button>
            <span class="bulk-import__stepper-value">{{ guest.plusOnes || 0 }}</span>
            <button type="button" class="bulk-import__stepper-btn" @click="updateGuestPlusOnes(guest.id, 1)">
              <Icon name="lucide:plus" size="10" />
            </button>
          </div>
          <button
            class="bulk-import__preview-remove"
            :title="t('editor.guests.bulkRemove')"
            @click="removeGuest(guest.id)"
          >
            <Icon name="lucide:x" size="12" />
          </button>
        </div>
      </div>

      <div v-if="validGuests.length === 0" class="bulk-import__empty">
        <AppText size="sm" muted>{{ t('editor.guests.bulkNoValid') }}</AppText>
      </div>

      <div class="bulk-import__actions">
        <AppButton
          variant="primary"
          size="sm"
          :loading="saving"
          :disabled="validGuests.length === 0"
          @click="handleSubmit"
        >
          <Icon name="lucide:user-plus" size="14" />
          {{ t('editor.guests.bulkSend', validGuests.length) }}
        </AppButton>
        <AppButton variant="ghost" size="sm" @click="goBack">
          {{ t('editor.guests.bulkBack') }}
        </AppButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bulk-import {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.bulk-import__tabs {
  display: flex;
  gap: var(--space-1);
  padding: 2px;
  background: var(--color-bg, var(--color-background));
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.bulk-import__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bulk-import__tab:hover {
  color: var(--color-text-primary);
}

.bulk-import__tab--active {
  background: var(--color-surface);
  color: var(--color-accent);
  box-shadow: var(--shadow-xs);
}

.bulk-import__hint {
  margin-bottom: calc(-1 * var(--space-1));
}

.bulk-import__textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg, var(--color-background));
  color: var(--color-text-primary);
  font-family: var(--font-family-mono, monospace);
  font-size: var(--text-sm);
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color var(--transition-fast);
}

.bulk-import__textarea:focus {
  border-color: var(--color-accent);
}

.bulk-import__textarea::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.bulk-import__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-4);
  border: 2px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.bulk-import__dropzone:hover,
.bulk-import__dropzone--dragging {
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

.bulk-import__file-input {
  display: none;
}

.bulk-import__template-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-accent);
  text-decoration: none;
  padding: var(--space-1) 0;
  transition: opacity var(--transition-fast);
}

.bulk-import__template-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.bulk-import__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.bulk-import__plus-ones {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.bulk-import__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.bulk-import__stepper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
}

.bulk-import__stepper-btn {
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

.bulk-import__stepper-btn:hover:not(:disabled) {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}

.bulk-import__stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.bulk-import__stepper-value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  min-width: 20px;
  text-align: center;
}

.bulk-import__stepper--compact {
  flex-shrink: 0;
  padding: 0 var(--space-1);
  gap: var(--space-1);
}

.bulk-import__stepper--compact .bulk-import__stepper-btn {
  width: 20px;
  height: 20px;
}

.bulk-import__stepper--compact .bulk-import__stepper-value {
  font-size: var(--text-xs);
  min-width: 16px;
}

.bulk-import__sub-events {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bulk-import__sub-event-checks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.bulk-import__check-item {
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

.bulk-import__check-item:hover {
  border-color: var(--color-accent);
}

.bulk-import__check-item--checked {
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

.bulk-import__checkbox {
  display: none;
}

.bulk-import__actions {
  display: flex;
  gap: var(--space-2);
}

/* Preview */
.bulk-import__counts {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.bulk-import__count {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.bulk-import__count--valid {
  color: var(--color-success);
}

.bulk-import__count--duplicate {
  color: var(--color-warning, #ff9f43);
}

.bulk-import__count--invalid {
  color: var(--color-error);
}

.bulk-import__preview-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
}

.bulk-import__preview-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
}

.bulk-import__preview-row--duplicate,
.bulk-import__preview-row--invalid {
  opacity: 0.5;
}

.bulk-import__preview-status {
  flex-shrink: 0;
  display: flex;
}

.bulk-import__icon--valid {
  color: var(--color-success);
}

.bulk-import__icon--duplicate {
  color: var(--color-warning, #ff9f43);
}

.bulk-import__icon--invalid {
  color: var(--color-error);
}

.bulk-import__preview-info {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
}

.bulk-import__preview-email {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bulk-import__preview-name {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.bulk-import__preview-remove {
  flex-shrink: 0;
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

.bulk-import__preview-remove:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}

.bulk-import__empty {
  text-align: center;
  padding: var(--space-4);
}

@media (max-width: 640px) {
  .bulk-import__preview-info {
    flex-direction: column;
    gap: 0;
  }
}
</style>
