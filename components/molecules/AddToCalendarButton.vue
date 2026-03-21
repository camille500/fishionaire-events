<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: { type: [String, Number], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
  subEventId: { type: [String, Number], default: null },
})

const showOptions = ref(false)
const wrapperRef = ref(null)

function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    showOptions.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

function formatGoogleDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

const googleCalendarUrl = computed(() => {
  if (!props.startDate) return ''
  const start = formatGoogleDate(props.startDate)
  const end = props.endDate
    ? formatGoogleDate(props.endDate)
    : formatGoogleDate(new Date(new Date(props.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString())

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: props.title,
    dates: `${start}/${end}`,
  })
  if (props.description) params.set('details', props.description)
  if (props.location) params.set('location', props.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
})

const icsUrl = computed(() => {
  let url = `/api/events/${props.eventId}/calendar`
  if (props.subEventId) url += `?subEventId=${props.subEventId}`
  return url
})

function toggle() {
  showOptions.value = !showOptions.value
}

function close() {
  showOptions.value = false
}
</script>

<template>
  <div v-if="startDate" ref="wrapperRef" class="add-to-calendar">
    <button class="add-to-calendar__trigger" @click="toggle">
      <Icon name="lucide:calendar-plus" size="16" />
      {{ t('invite.calendar.addToCalendar') }}
    </button>

    <Transition name="dropdown">
      <div v-if="showOptions" class="add-to-calendar__dropdown">
        <a
          :href="googleCalendarUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="add-to-calendar__option"
          @click="close"
        >
          <Icon name="lucide:globe" size="14" />
          Google Calendar
        </a>
        <a
          :href="icsUrl"
          download
          class="add-to-calendar__option"
          @click="close"
        >
          <Icon name="lucide:download" size="14" />
          {{ t('invite.calendar.downloadIcs') }}
        </a>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.add-to-calendar {
  position: relative;
  display: inline-flex;
}

.add-to-calendar__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid color-mix(in srgb, var(--event-accent, var(--color-accent)) 30%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 8%, transparent);
  color: var(--event-accent, var(--color-accent));
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-to-calendar__trigger:hover {
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 14%, transparent);
  border-color: color-mix(in srgb, var(--event-accent, var(--color-accent)) 50%, transparent);
}

.add-to-calendar__dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-2);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.add-to-calendar__option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: background var(--transition-fast);
}

.add-to-calendar__option:hover {
  background: color-mix(in srgb, var(--event-accent, var(--color-accent)) 8%, transparent);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
