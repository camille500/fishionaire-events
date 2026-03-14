<script setup>
import { CalendarDate } from '@internationalized/date'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  minDate: { type: String, default: '' },
  error: { type: String, default: '' },
  touched: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const { locale } = useI18n()
const { stringToCalendarDate, calendarDateToString, parseTime, formatDateDisplay, stringToMinDate } = useDateConversion()

const open = ref(false)

const calendarValue = computed({
  get() {
    return stringToCalendarDate(props.modelValue) || new CalendarDate(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    )
  },
  set(val) {
    if (!val) return
    emit('update:modelValue', calendarDateToString(val, hour.value, minute.value))
  },
})

const time = parseTime(props.modelValue)
const hour = ref(props.modelValue ? time.hour : 12)
const minute = ref(props.modelValue ? time.minute : 0)

watch(() => props.modelValue, (val) => {
  if (val) {
    const t = parseTime(val)
    hour.value = t.hour
    minute.value = t.minute
  }
})

watch([hour, minute], () => {
  if (props.modelValue) {
    const date = stringToCalendarDate(props.modelValue)
    if (date) {
      emit('update:modelValue', calendarDateToString(date, hour.value, minute.value))
    }
  }
})

const minCalendarDate = computed(() => stringToMinDate(props.minDate))

const displayText = computed(() => {
  return formatDateDisplay(props.modelValue, locale.value)
})

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function onPopoverClose() {
  open.value = false
  emit('blur')
}

function clearDate() {
  emit('update:modelValue', '')
  open.value = false
}
</script>

<template>
  <div class="editor-date-picker">
    <UPopover v-model:open="open" @close="onPopoverClose">
      <button
        type="button"
        class="editor-date-picker__trigger"
        :class="{
          'editor-date-picker__trigger--has-value': modelValue,
          'editor-date-picker__trigger--error': error && touched,
          'editor-date-picker__trigger--open': open,
        }"
      >
        <span v-if="displayText" class="editor-date-picker__display">{{ displayText }}</span>
        <span v-else class="editor-date-picker__placeholder">{{ placeholder }}</span>
      </button>

      <template #content>
        <div class="editor-date-picker__panel">
          <UCalendar
            v-model="calendarValue"
            class="editor-date-picker__calendar"
            :min-value="minCalendarDate"
          />

          <div class="editor-date-picker__time">
            <Icon name="lucide:clock" size="14" class="editor-date-picker__time-icon" />
            <select
              v-model.number="hour"
              class="editor-date-picker__select"
            >
              <option v-for="h in hours" :key="h" :value="h">
                {{ String(h).padStart(2, '0') }}
              </option>
            </select>
            <span class="editor-date-picker__colon">:</span>
            <select
              v-model.number="minute"
              class="editor-date-picker__select"
            >
              <option v-for="m in minutes" :key="m" :value="m">
                {{ String(m).padStart(2, '0') }}
              </option>
            </select>
          </div>

          <button
            v-if="modelValue"
            type="button"
            class="editor-date-picker__clear"
            @click="clearDate"
          >
            <Icon name="lucide:x" size="12" />
            Wissen
          </button>
        </div>
      </template>
    </UPopover>

    <EditorFieldError :message="error" :visible="!!(error && touched)" />
  </div>
</template>

<style scoped>
.editor-date-picker {
  flex: 1;
  min-width: 0;
}

.editor-date-picker__trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.editor-date-picker__trigger:hover {
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
}

.editor-date-picker__trigger--open {
  background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 25%, transparent);
}

.editor-date-picker__trigger--error {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-error) 25%, transparent);
}

.editor-date-picker__placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.editor-date-picker__display {
  color: var(--color-text-primary);
}

.editor-date-picker__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  min-width: 280px;
}

.editor-date-picker__calendar {
  border: none;
}

.editor-date-picker__time {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
  border-radius: var(--radius-md);
}

.editor-date-picker__time-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.editor-date-picker__select {
  appearance: none;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  padding: var(--space-1) var(--space-2);
  cursor: pointer;
  transition: border-color var(--transition-fast);
  min-width: 52px;
  text-align: center;
}

.editor-date-picker__select:hover {
  border-color: var(--color-accent);
}

.editor-date-picker__select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

.editor-date-picker__colon {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
}

.editor-date-picker__clear {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.editor-date-picker__clear:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}

@media (max-width: 640px) {
  .editor-date-picker__trigger {
    padding: var(--space-2);
  }
}
</style>
