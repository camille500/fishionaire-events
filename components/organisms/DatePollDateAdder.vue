<script setup>
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

const { t, locale } = useI18n()
const { parseMultiple, dateToLocalString } = useNaturalDateParse()

const props = defineProps({
  eventId: { type: Number, required: true },
  existingDates: { type: Array, default: () => [] },
})

const emit = defineEmits(['dates-added', 'cancel'])

// ── Staging area ─────────────────────────────────────────
const stagedDates = ref([])
const saving = ref(false)

// ── Same time for all ────────────────────────────────────
const sameTimeEnabled = ref(false)
const sameStartTime = ref('')
const sameEndTime = ref('')

// ── Natural language input ───────────────────────────────
const naturalInput = ref('')
const parsedResults = ref([])
const naturalInputEl = ref(null)

watch(naturalInput, (text) => {
  if (!text.trim()) {
    parsedResults.value = []
    return
  }
  parsedResults.value = parseMultiple(text)
})

function addFromNatural() {
  if (!parsedResults.value.length) return
  for (const result of parsedResults.value) {
    addStagedDate(result.localString)
  }
  naturalInput.value = ''
  parsedResults.value = []
  nextTick(() => naturalInputEl.value?.focus())
}

function onNaturalKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addFromNatural()
  }
}

// ── Calendar multi-select ────────────────────────────────
const calendarSelected = ref([])
const calendarPlaceholder = ref(today(getLocalTimeZone()))
const displayedMonth = computed(() => ({
  month: calendarPlaceholder.value.month,
  year: calendarPlaceholder.value.year,
}))

function addFromCalendar() {
  for (const calDate of calendarSelected.value) {
    const dateStr = `${calDate.year}-${String(calDate.month).padStart(2, '0')}-${String(calDate.day).padStart(2, '0')}T12:00`
    addStagedDate(dateStr)
  }
  calendarSelected.value = []
}

// ── Quick patterns ───────────────────────────────────────
function getDaysInMonth(year, month) {
  const dates = []
  const lastDay = new Date(year, month, 0).getDate()
  for (let d = 1; d <= lastDay; d++) {
    dates.push(new Date(year, month - 1, d))
  }
  return dates
}

function addPattern(dayFilter) {
  const { year, month } = displayedMonth.value
  const days = getDaysInMonth(year, month)
  const nowDate = new Date()
  nowDate.setHours(0, 0, 0, 0)

  for (const day of days) {
    if (day < nowDate) continue
    if (dayFilter(day.getDay())) {
      addStagedDate(dateToLocalString(day))
    }
  }
}

function addWeekends() {
  addPattern(dow => dow === 0 || dow === 6)
}

function addEveryDay(targetDow) {
  addPattern(dow => dow === targetDow)
}

const displayedMonthName = computed(() => {
  const { year, month } = displayedMonth.value
  return new Date(year, month - 1).toLocaleDateString(locale.value === 'nl' ? 'nl-NL' : 'en-GB', {
    month: 'long',
  })
})

// ── Staging helpers ──────────────────────────────────────
let nextId = 0

function dateKey(dateStr) {
  // Normalize to date-only for duplicate checking
  return dateStr.slice(0, 10)
}

function isDuplicate(dateStr) {
  const key = dateKey(dateStr)
  const inStaged = stagedDates.value.some(s => dateKey(s.date) === key)
  const inExisting = props.existingDates.some(d => dateKey(d) === key)
  return inStaged || inExisting
}

const duplicateWarning = ref(null)
let duplicateTimer = null

function addStagedDate(dateStr) {
  if (isDuplicate(dateStr)) {
    duplicateWarning.value = dateStr
    clearTimeout(duplicateTimer)
    duplicateTimer = setTimeout(() => { duplicateWarning.value = null }, 2500)
    return
  }
  stagedDates.value.push({
    id: `staged-${nextId++}`,
    date: dateStr,
    startTime: null,
    endTime: null,
  })
}

function removeStagedDate(id) {
  stagedDates.value = stagedDates.value.filter(s => s.id !== id)
}

// ── Computed dates with time applied ─────────────────────
const finalDates = computed(() => {
  return stagedDates.value.map(s => {
    const base = s.date.slice(0, 10)
    if (sameTimeEnabled.value && sameStartTime.value) {
      return {
        date: s.date,
        startTime: `${base}T${sameStartTime.value}`,
        endTime: sameEndTime.value ? `${base}T${sameEndTime.value}` : null,
      }
    }
    return {
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
    }
  })
})

// ── Save ─────────────────────────────────────────────────
async function saveDates() {
  if (!stagedDates.value.length) return
  saving.value = true
  try {
    const result = await $fetch(`/api/events/${props.eventId}/date-poll/options/bulk`, {
      method: 'POST',
      body: {
        options: finalDates.value,
      },
    })
    stagedDates.value = []
    sameTimeEnabled.value = false
    sameStartTime.value = ''
    sameEndTime.value = ''
    emit('dates-added', result)
  } finally {
    saving.value = false
  }
}

const timeOptions = computed(() => {
  const options = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      options.push(val)
    }
  }
  return options
})

const naturalPlaceholder = computed(() => {
  return locale.value === 'nl'
    ? 'Typ data... (bijv. "28 t/m 30 maart" of "5, 6 en 7 april")'
    : 'Type dates... (e.g. "May 5 to 8" or "March 28, 29 and April 4")'
})
</script>

<template>
  <div class="date-adder">
    <!-- Staging area -->
    <div v-if="stagedDates.length" class="date-adder__staged">
      <div class="date-adder__staged-header">
        <AppText size="xs" muted>
          {{ t('editor.datePoll.stagedDates') }}
          <strong>({{ stagedDates.length }})</strong>
        </AppText>
      </div>
      <TransitionGroup name="chip" tag="div" class="date-adder__chips">
        <DatePollDateChip
          v-for="item in stagedDates"
          :key="item.id"
          :date="item.date"
          :start-time="sameTimeEnabled && sameStartTime ? `${item.date.slice(0, 10)}T${sameStartTime}` : item.startTime"
          :end-time="sameTimeEnabled && sameEndTime ? `${item.date.slice(0, 10)}T${sameEndTime}` : item.endTime"
          @remove="removeStagedDate(item.id)"
        />
      </TransitionGroup>
    </div>

    <!-- Same time for all -->
    <div v-if="stagedDates.length" class="date-adder__same-time">
      <label class="date-adder__same-time-toggle">
        <input
          v-model="sameTimeEnabled"
          type="checkbox"
          class="date-adder__checkbox"
        />
        <span class="date-adder__same-time-label">{{ t('editor.datePoll.sameTimeForAll') }}</span>
      </label>
      <Transition name="fade">
        <div v-if="sameTimeEnabled" class="date-adder__time-selectors">
          <div class="date-adder__time-group">
            <select v-model="sameStartTime" class="date-adder__time-select">
              <option value="" disabled>{{ t('editor.datePoll.startTimeLabel') }}</option>
              <option v-for="time in timeOptions" :key="`s-${time}`" :value="time">{{ time }}</option>
            </select>
          </div>
          <span class="date-adder__time-dash">–</span>
          <div class="date-adder__time-group">
            <select v-model="sameEndTime" class="date-adder__time-select">
              <option value="">{{ t('editor.datePoll.endTimeLabel') }}</option>
              <option v-for="time in timeOptions" :key="`e-${time}`" :value="time">{{ time }}</option>
            </select>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Duplicate warning -->
    <Transition name="fade">
      <div v-if="duplicateWarning" class="date-adder__duplicate-warning">
        <Icon name="lucide:alert-circle" size="12" />
        {{ t('editor.datePoll.dateAlreadyAdded') }}
      </div>
    </Transition>

    <!-- Natural language input -->
    <div class="date-adder__natural">
      <div class="date-adder__natural-wrap">
        <Icon name="lucide:sparkles" size="14" class="date-adder__natural-icon" />
        <input
          ref="naturalInputEl"
          v-model="naturalInput"
          type="text"
          class="date-adder__natural-input"
          :placeholder="naturalPlaceholder"
          autofocus
          @keydown="onNaturalKeydown"
        />
      </div>
      <Transition name="fade">
        <div v-if="parsedResults.length" class="date-adder__preview">
          <Icon name="lucide:check-circle" size="14" class="date-adder__preview-icon" />
          <span class="date-adder__preview-text">
            {{ parsedResults.map(r => r.preview).join(', ') }}
          </span>
          <button type="button" class="date-adder__preview-add" @click="addFromNatural">
            <Icon name="lucide:plus" size="12" />
            {{ t('common.add') }}
          </button>
        </div>
      </Transition>
      <div v-if="naturalInput.trim() && !parsedResults.length" class="date-adder__no-parse">
        <Icon name="lucide:help-circle" size="12" />
        <span>{{ locale === 'nl' ? 'Typ bijv. "28 maart", "5 t/m 8 mei" of "volgende zaterdag"' : 'Try "March 28", "May 5 to 8" or "next Saturday 3pm"' }}</span>
      </div>
    </div>

    <!-- Divider -->
    <div class="date-adder__divider">
      <span>{{ t('editor.datePoll.orPickFromCalendar') }}</span>
    </div>

    <!-- Calendar + Quick patterns -->
    <div class="date-adder__calendar-section">
      <div class="date-adder__calendar-wrap">
        <UCalendar
          v-model="calendarSelected"
          v-model:placeholder="calendarPlaceholder"
          multiple
          class="date-adder__calendar"
        />
        <Transition name="fade">
          <AppButton
            v-if="calendarSelected.length"
            variant="primary"
            size="sm"
            class="date-adder__calendar-add"
            @click="addFromCalendar"
          >
            <Icon name="lucide:plus" size="12" />
            {{ t('editor.datePoll.addSelectedDates', { count: calendarSelected.length }, calendarSelected.length) }}
          </AppButton>
        </Transition>
      </div>

      <div class="date-adder__quick">
        <AppText size="xs" muted class="date-adder__quick-label">
          {{ t('editor.datePoll.quickPatterns') }}
          <span class="date-adder__quick-month">{{ displayedMonthName }}</span>
        </AppText>
        <div class="date-adder__quick-buttons">
          <button type="button" class="date-adder__quick-btn" @click="addWeekends">
            {{ t('editor.datePoll.weekends') }}
          </button>
          <button type="button" class="date-adder__quick-btn" @click="addEveryDay(6)">
            {{ t('editor.datePoll.everySaturday') }}
          </button>
          <button type="button" class="date-adder__quick-btn" @click="addEveryDay(0)">
            {{ t('editor.datePoll.everySunday') }}
          </button>
          <button type="button" class="date-adder__quick-btn" @click="addEveryDay(5)">
            {{ t('editor.datePoll.everyFriday') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Save bar -->
    <div class="date-adder__save-bar">
      <AppButton
        variant="primary"
        size="sm"
        :loading="saving"
        :disabled="!stagedDates.length"
        @click="saveDates"
      >
        <Icon name="lucide:check" size="14" />
        {{ t('editor.datePoll.addDateCount', { count: stagedDates.length }, stagedDates.length) }}
      </AppButton>
      <AppButton variant="ghost" size="sm" @click="emit('cancel')">
        {{ t('common.cancel') }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.date-adder {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1.5px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-lg);
  animation: adder-enter 300ms ease-out;
}

@keyframes adder-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staging area */
.date-adder__staged {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.date-adder__staged-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date-adder__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Chip transitions */
.chip-enter-active {
  transition: all 200ms ease-out;
}

.chip-leave-active {
  transition: all 150ms ease-in;
}

.chip-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.chip-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.chip-move {
  transition: transform 200ms ease;
}

/* Same time for all */
.date-adder__same-time {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
  border-radius: var(--radius-md);
}

.date-adder__same-time-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.date-adder__checkbox {
  accent-color: var(--color-accent);
}

.date-adder__same-time-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.date-adder__time-selectors {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.date-adder__time-select {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  font-variant-numeric: tabular-nums;
  outline: none;
  transition: border-color var(--transition-fast);
}

.date-adder__time-select:focus {
  border-color: var(--color-accent);
}

.date-adder__time-dash {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-semibold);
}

/* Duplicate warning */
.date-adder__duplicate-warning {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 25%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-warning);
}

/* Natural language input */
.date-adder__natural {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.date-adder__natural-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-background);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.date-adder__natural-wrap:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.date-adder__natural-icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.date-adder__natural-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
}

.date-adder__natural-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* Preview */
.date-adder__preview {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 20%, transparent);
  border-radius: var(--radius-md);
}

.date-adder__preview-icon {
  color: var(--color-success);
  flex-shrink: 0;
}

.date-adder__preview-text {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.date-adder__preview-add {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-success);
  color: white;
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--transition-fast);
  white-space: nowrap;
}

.date-adder__preview-add:hover {
  opacity: 0.9;
}

.date-adder__no-parse {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  padding: 0 var(--space-1);
}

/* Divider */
.date-adder__divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.date-adder__divider::before,
.date-adder__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

/* Calendar section */
.date-adder__calendar-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-4);
  align-items: start;
}

.date-adder__calendar-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.date-adder__calendar {
  border: none;
}

.date-adder__calendar-add {
  align-self: flex-start;
}

/* Quick patterns */
.date-adder__quick {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-1);
}

.date-adder__quick-label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.date-adder__quick-month {
  text-transform: capitalize;
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

.date-adder__quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.date-adder__quick-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.date-adder__quick-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 5%, transparent);
}

.date-adder__quick-btn:active {
  transform: scale(0.97);
}

/* Save bar */
.date-adder__save-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
}

/* Fade transition */
.fade-enter-active {
  transition: all 200ms ease-out;
}

.fade-leave-active {
  transition: all 150ms ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Mobile */
@media (max-width: 640px) {
  .date-adder {
    padding: var(--space-3);
  }

  .date-adder__calendar-section {
    grid-template-columns: 1fr;
  }

  .date-adder__quick-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .date-adder__time-selectors {
    flex-wrap: wrap;
  }
}
</style>
