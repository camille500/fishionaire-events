<script setup>
import { VueDraggable } from 'vue-draggable-plus'

const { t } = useI18n()

const emit = defineEmits(['upgrade'])

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  locked: {
    type: Boolean,
    default: false,
  },
})

const items = ref([])
const showForm = ref(false)
const editingItem = ref(null)
const loading = ref(false)
const listRef = ref(null)

const { animateReorderStart, animateReorderEnd, staggerIn } = useEditorAnimations()

async function fetchTimeline() {
  try {
    items.value = await $fetch(`/api/events/${props.eventId}/timeline`)
    nextTick(() => {
      if (listRef.value?.$el) staggerIn(listRef.value.$el, '.event-timeline__items > *')
    })
  } catch {
    // May not have access
  }
}

async function onCreateItem(data) {
  loading.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/timeline`, {
      method: 'POST',
      body: data,
    })
    showForm.value = false
    await fetchTimeline()
  } finally {
    loading.value = false
  }
}

async function onUpdateItem(data) {
  if (!editingItem.value) return
  loading.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/timeline/${editingItem.value.id}`, {
      method: 'PUT',
      body: data,
    })
    editingItem.value = null
    await fetchTimeline()
  } finally {
    loading.value = false
  }
}

async function onDeleteItem(item) {
  if (!confirm(t('dashboard.eventEditor.timelineItemDeleted') + '?')) return
  await $fetch(`/api/events/${props.eventId}/timeline/${item.id}`, {
    method: 'DELETE',
  })
  await fetchTimeline()
}

function onEdit(item) {
  editingItem.value = item
  showForm.value = false
}

function onCancelEdit() {
  editingItem.value = null
  showForm.value = false
}

async function onReorder() {
  const order = items.value.map((item) => item.id)
  try {
    await $fetch(`/api/events/${props.eventId}/timeline/reorder`, {
      method: 'PUT',
      body: { order },
    })
  } catch {
    await fetchTimeline()
  }
}

onMounted(() => {
  if (!props.locked) fetchTimeline()
})
</script>

<template>
  <div class="event-timeline">
    <div class="event-timeline__header">
      <div>
        <AppHeading :level="3" size="sm">{{ t('dashboard.eventEditor.timelineSection') }}</AppHeading>
        <AppText size="sm" muted>{{ t('dashboard.eventEditor.timelineSubtitle') }}</AppText>
      </div>
      <AppButton
        v-if="editable && !locked && !showForm"
        variant="ghost"
        size="sm"
        @click="showForm = true; editingItem = null"
      >
        <Icon name="lucide:plus" size="14" />
        {{ t('dashboard.eventEditor.addTimelineItem') }}
      </AppButton>
    </div>

    <EditorEmptySection
      v-if="locked"
      icon="lucide:clock"
      :title="t('editor.emptyStates.noTimeline')"
      :description="t('editor.emptyStates.noTimelineDesc')"
      :locked="true"
      :upgrade-label="t('editor.emptyStates.upgradeToPro')"
      @upgrade="emit('upgrade')"
    />

    <template v-else>
      <div v-if="items.length === 0 && !showForm" class="event-timeline__empty">
        <AppText size="sm" muted>{{ t('dashboard.eventEditor.noTimelineItems') }}</AppText>
      </div>

      <VueDraggable
        v-if="items.length > 0"
        ref="listRef"
        v-model="items"
        :animation="200"
        handle=".timeline-item-card__drag"
        :disabled="!editable"
        class="event-timeline__items"
        @start="(e) => animateReorderStart(e.item)"
        @end="(e) => { animateReorderEnd(e.item); onReorder() }"
      >
        <template v-for="item in items" :key="item.id">
          <TimelineItemForm
            v-if="editingItem?.id === item.id"
            :item="item"
            :loading="loading"
            @submit="onUpdateItem"
            @cancel="onCancelEdit"
          />
          <TimelineItemCard
            v-else
            :item="item"
            :editable="editable"
            @edit="onEdit"
            @delete="onDeleteItem"
          />
        </template>
      </VueDraggable>

      <TimelineItemForm
        v-if="showForm"
        :loading="loading"
        @submit="onCreateItem"
        @cancel="onCancelEdit"
      />
    </template>
  </div>
</template>

<style scoped>
.event-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.event-timeline__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.event-timeline__locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
}

.event-timeline__empty {
  padding: var(--space-6);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
}

.event-timeline__items {
  display: flex;
  flex-direction: column;
}
</style>
