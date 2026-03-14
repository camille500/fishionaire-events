<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
})

const subEvents = ref([])
const myRsvps = ref([])
const loading = ref(false)

async function fetchData() {
  const [subs, rsvps] = await Promise.all([
    $fetch(`/api/events/${props.eventId}/sub-events`),
    $fetch(`/api/events/${props.eventId}/my-rsvps?email=${encodeURIComponent(props.email)}`),
  ])
  subEvents.value = subs
  myRsvps.value = rsvps
}

function getStatus(subEventId) {
  const rsvp = myRsvps.value.find((r) => r.subEventId === subEventId)
  return rsvp?.status || null
}

async function onRsvp({ subEventId, status }) {
  loading.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/sub-events/${subEventId}/rsvp`, {
      method: 'POST',
      body: { email: props.email, status },
    })
    await fetchData()
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="rsvp-section" v-if="subEvents.length > 0">
    <div class="rsvp-section__header">
      <AppHeading :level="3" size="sm">{{ t('dashboard.rsvp.perSubEvent') }}</AppHeading>
    </div>
    <div class="rsvp-section__list">
      <SubEventRsvpToggle
        v-for="se in subEvents"
        :key="se.id"
        :sub-event="se"
        :current-status="getStatus(se.id)"
        :loading="loading"
        @rsvp="onRsvp"
      />
    </div>
  </div>
</template>

<style scoped>
.rsvp-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.rsvp-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
