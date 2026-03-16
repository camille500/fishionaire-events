<script setup>
const { t } = useI18n()
const { eventId, eventData, form, canEdit } = useEventEditor()

const hasAi = computed(() => !!eventData.value?.features?.aiAssistant)
const hasTimeline = computed(() => !!eventData.value?.features?.timeline)

const subEventListRef = ref(null)
const detailSubEvent = ref(null)

const existingSubEvents = computed(() => subEventListRef.value?.subEvents || [])

function onSubEventsCreated() {
  subEventListRef.value?.fetchSubEvents?.()
}

function onAddManually() {
  const list = subEventListRef.value
  if (list) {
    list.showForm = true
  }
}

function onOpenDetail(subEvent) {
  detailSubEvent.value = subEvent
}

function onCloseDetail() {
  detailSubEvent.value = null
}

function onDetailSaved() {
  subEventListRef.value?.fetchSubEvents?.()
}
</script>

<template>
  <div class="editor-schedule">
    <!-- AI Co-Creation Flow (replaces old programme banner) -->
    <AiCoCreateFlow
      v-if="canEdit && existingSubEvents.length === 0"
      :event-id="eventData.id"
      :event-type="form.eventType"
      :event-title="form.title"
      :has-ai="hasAi"
      :can-edit="canEdit"
      :existing-sub-events="existingSubEvents"
      @sub-events-created="onSubEventsCreated"
      @add-manually="onAddManually"
    />

    <!-- Sub-events list -->
    <section class="editor-schedule__section">
      <SubEventList
        ref="subEventListRef"
        :event-id="eventData.id"
        :can-edit="canEdit"
        :event-date="form.eventDate"
        :has-ai="hasAi"
        :event-type="form.eventType"
        @open-detail="onOpenDetail"
      />

      <!-- AI co-create pill (when sub-events exist) -->
      <AiCoCreateFlow
        v-if="canEdit && existingSubEvents.length > 0"
        :event-id="eventData.id"
        :event-type="form.eventType"
        :event-title="form.title"
        :has-ai="hasAi"
        :can-edit="canEdit"
        :existing-sub-events="existingSubEvents"
        @sub-events-created="onSubEventsCreated"
        @add-manually="onAddManually"
      />
    </section>

    <!-- Timeline (Pro feature) -->
    <section
      class="editor-schedule__section"
      :class="{ 'editor-schedule__section--locked': !hasTimeline }"
    >
      <EventTimelineEditor
        :event-id="eventData.id"
        :editable="canEdit"
        :locked="!hasTimeline"
      />
    </section>

    <!-- Detail Panel (slide-over) -->
    <SubEventDetailPanel
      v-if="detailSubEvent"
      :sub-event="detailSubEvent"
      :event-id="eventData.id"
      :can-edit="canEdit"
      @close="onCloseDetail"
      @saved="onDetailSaved"
    />
  </div>
</template>

<style scoped>
.editor-schedule {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.editor-schedule__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.editor-schedule__section--locked {
  position: relative;
}
</style>
