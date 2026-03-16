<script setup>
import { VueDraggable } from 'vue-draggable-plus'

const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open-detail'])

const subEvents = ref([])
const showForm = ref(false)
const editingSubEvent = ref(null)
const loading = ref(false)
const listRef = ref(null)

const { animateReorderStart, animateReorderEnd, staggerIn } = useEditorAnimations()

async function fetchSubEvents() {
  subEvents.value = await $fetch(`/api/events/${props.eventId}/sub-events`)
  nextTick(() => {
    if (listRef.value?.$el) staggerIn(listRef.value.$el, '.sub-event-list__items > *')
  })
}

async function onCreateSubEvent(data) {
  loading.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/sub-events`, {
      method: 'POST',
      body: data,
    })
    showForm.value = false
    await fetchSubEvents()
  } finally {
    loading.value = false
  }
}

async function onUpdateSubEvent(data) {
  if (!editingSubEvent.value) return
  loading.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/sub-events/${editingSubEvent.value.id}`, {
      method: 'PUT',
      body: data,
    })
    editingSubEvent.value = null
    await fetchSubEvents()
  } finally {
    loading.value = false
  }
}

async function onDeleteSubEvent(subEvent) {
  if (!confirm(t('dashboard.eventEditor.confirmDeleteSubEvent'))) return
  await $fetch(`/api/events/${props.eventId}/sub-events/${subEvent.id}`, {
    method: 'DELETE',
  })
  await fetchSubEvents()
}

function onEdit(subEvent) {
  editingSubEvent.value = subEvent
  showForm.value = false
}

function onCancelEdit() {
  editingSubEvent.value = null
  showForm.value = false
}

function onCardClick(subEvent) {
  if (!editingSubEvent.value) {
    emit('open-detail', subEvent)
  }
}

async function onReorder() {
  const order = subEvents.value.map((se) => se.id)
  try {
    await $fetch(`/api/events/${props.eventId}/sub-events/reorder`, {
      method: 'PUT',
      body: { order },
    })
  } catch {
    await fetchSubEvents()
  }
}

onMounted(fetchSubEvents)

defineExpose({ fetchSubEvents, subEvents })
</script>

<template>
  <div class="sub-event-list">
    <div class="sub-event-list__header">
      <OnboardingTooltip
        tooltip-key="editor-activities"
        :description="t('editor.onboarding.addActivities')"
        position="bottom"
      >
        <div>
          <AppHeading :level="3" size="sm">{{ t('dashboard.eventEditor.subEventsSection') }}</AppHeading>
          <AppText size="sm" muted>{{ t('dashboard.eventEditor.subEventsSubtitle') }}</AppText>
        </div>
      </OnboardingTooltip>
      <AppButton v-if="canEdit && !showForm" variant="ghost" size="sm" @click="showForm = true; editingSubEvent = null">
        <Icon name="lucide:plus" size="14" />
        {{ t('dashboard.eventEditor.addSubEvent') }}
      </AppButton>
    </div>

    <EditorEmptySection
      v-if="subEvents.length === 0 && !showForm"
      icon="lucide:layers"
      :title="t('editor.emptyStates.noActivities')"
      :description="t('editor.emptyStates.noActivitiesDesc')"
      :cta-label="canEdit ? t('editor.emptyStates.addFirst') : ''"
      @action="showForm = true"
    />

    <VueDraggable
      v-if="subEvents.length > 0"
      ref="listRef"
      v-model="subEvents"
      :animation="200"
      handle=".sub-event-card__drag"
      :disabled="!canEdit"
      class="sub-event-list__items"
      @start="(e) => animateReorderStart(e.item)"
      @end="(e) => { animateReorderEnd(e.item); onReorder() }"
    >
      <template v-for="se in subEvents" :key="se.id">
        <SubEventForm
          v-if="editingSubEvent?.id === se.id"
          :sub-event="se"
          :loading="loading"
          @submit="onUpdateSubEvent"
          @cancel="onCancelEdit"
        />
        <SubEventCard
          v-else
          :sub-event="se"
          :can-edit="canEdit"
          @edit="onEdit"
          @delete="onDeleteSubEvent"
          @click="onCardClick(se)"
        />
      </template>
    </VueDraggable>

    <SubEventForm
      v-if="showForm"
      :loading="loading"
      @submit="onCreateSubEvent"
      @cancel="onCancelEdit"
    />
  </div>
</template>

<style scoped>
.sub-event-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sub-event-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.sub-event-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
}

.sub-event-list__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.4;
}

.sub-event-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
