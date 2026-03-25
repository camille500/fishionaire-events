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
  eventDate: {
    type: String,
    default: null,
  },
  hasAi: {
    type: Boolean,
    default: false,
  },
  eventType: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['open-detail'])

const subEvents = ref([])
const showForm = ref(false)
const editingSubEvent = ref(null)
const loading = ref(false)
const listRef = ref(null)

// Selection mode
const selectionMode = ref(false)
const selectedIds = ref(new Set())

const { animateReorderStart, animateReorderEnd, staggerIn } = useEditorAnimations()

const allSelected = computed(() =>
  subEvents.value.length > 0 && selectedIds.value.size === subEvents.value.length
)

function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedIds.value = new Set()
  }
}

function toggleSelect(id) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(subEvents.value.map((se) => se.id))
  }
}

async function fetchSubEvents() {
  subEvents.value = await $fetch(`/api/events/${props.eventId}/sub-events`)
  nextTick(() => {
    if (listRef.value?.$el) staggerIn(listRef.value.$el, '.sub-event-list__items > *')
  })
}

async function onCreateSubEvent(data) {
  loading.value = true
  try {
    const created = await $fetch(`/api/events/${props.eventId}/sub-events`, {
      method: 'POST',
      body: data,
    })
    showForm.value = false
    subEvents.value = [...subEvents.value, created]
  } finally {
    loading.value = false
  }
}

async function onUpdateSubEvent(data) {
  if (!editingSubEvent.value) return
  loading.value = true
  try {
    const updated = await $fetch(`/api/events/${props.eventId}/sub-events/${editingSubEvent.value.id}`, {
      method: 'PUT',
      body: data,
    })
    subEvents.value = subEvents.value.map((se) =>
      se.id === editingSubEvent.value.id ? { ...se, ...updated } : se
    )
    editingSubEvent.value = null
  } finally {
    loading.value = false
  }
}

const confirmDeleteSubEvent = ref(null)
const confirmBulkDelete = ref(false)

function onDeleteSubEvent(subEvent) {
  confirmDeleteSubEvent.value = subEvent
}

async function doDeleteSubEvent() {
  if (!confirmDeleteSubEvent.value) return
  const subEvent = confirmDeleteSubEvent.value
  confirmDeleteSubEvent.value = null
  subEvents.value = subEvents.value.filter((se) => se.id !== subEvent.id)
  try {
    await $fetch(`/api/events/${props.eventId}/sub-events/${subEvent.id}`, {
      method: 'DELETE',
    })
  } catch {
    await fetchSubEvents()
  }
}

function onBulkDelete() {
  const count = selectedIds.value.size
  if (count === 0) return
  confirmBulkDelete.value = true
}

async function doBulkDelete() {
  confirmBulkDelete.value = false
  const idsToDelete = [...selectedIds.value]
  subEvents.value = subEvents.value.filter((se) => !selectedIds.value.has(se.id))
  selectedIds.value = new Set()
  selectionMode.value = false

  try {
    await $fetch(`/api/events/${props.eventId}/sub-events/bulk-delete`, {
      method: 'POST',
      body: { ids: idsToDelete },
    })
  } catch {
    await fetchSubEvents()
  }
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
  if (selectionMode.value) {
    toggleSelect(subEvent.id)
    return
  }
  if (!editingSubEvent.value) {
    emit('open-detail', subEvent)
  }
}

function onAddClick() {
  showForm.value = true
  editingSubEvent.value = null
  selectionMode.value = false
  selectedIds.value = new Set()
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
      <div>
        <AppHeading :level="3" size="sm">{{ t('dashboard.eventEditor.subEventsSection') }}</AppHeading>
        <AppText size="sm" muted>{{ t('dashboard.eventEditor.subEventsSubtitle') }}</AppText>
      </div>
      <div v-if="canEdit" class="sub-event-list__actions">
        <AppButton
          v-if="subEvents.length > 0 && !showForm"
          variant="ghost"
          size="sm"
          @click="toggleSelectionMode"
        >
          <Icon :name="selectionMode ? 'lucide:x' : 'lucide:check-square'" size="14" />
          {{ selectionMode ? t('dashboard.cancel') : t('dashboard.eventEditor.selectItems') }}
        </AppButton>
        <AppButton v-if="!showForm && !selectionMode" variant="ghost" size="sm" @click="onAddClick">
          <Icon name="lucide:plus" size="14" />
          {{ t('dashboard.eventEditor.addSubEvent') }}
        </AppButton>
      </div>
    </div>

    <!-- Selection toolbar -->
    <Transition name="toolbar">
      <div v-if="selectionMode && subEvents.length > 0" class="sub-event-list__toolbar">
        <label class="sub-event-list__select-all">
          <input
            type="checkbox"
            :checked="allSelected"
            :indeterminate="selectedIds.size > 0 && !allSelected"
            @change="toggleSelectAll"
          />
          {{ t('dashboard.eventEditor.selectAll') }}
        </label>
        <span v-if="selectedIds.size > 0" class="sub-event-list__selection-count">
          {{ t('dashboard.eventEditor.itemsSelected', { count: selectedIds.size }) }}
        </span>
        <AppButton
          v-if="selectedIds.size > 0"
          variant="danger"
          size="sm"
          @click="onBulkDelete"
        >
          <Icon name="lucide:trash-2" size="14" />
          {{ t('dashboard.eventEditor.deleteSelected') }}
        </AppButton>
      </div>
    </Transition>

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
      :disabled="!canEdit || selectionMode"
      class="sub-event-list__items"
      @start="(e) => animateReorderStart(e.item)"
      @end="(e) => { animateReorderEnd(e.item); onReorder() }"
    >
      <template v-for="se in subEvents" :key="se.id">
        <SubEventForm
          v-if="editingSubEvent?.id === se.id"
          :sub-event="se"
          :loading="loading"
          :event-date="eventDate"
          :has-ai="hasAi"
          :event-type="eventType"
          @submit="onUpdateSubEvent"
          @cancel="onCancelEdit"
        />
        <SubEventCard
          v-else
          :sub-event="se"
          :can-edit="canEdit && !selectionMode"
          :selectable="selectionMode"
          :selected="selectedIds.has(se.id)"
          @edit="onEdit"
          @delete="onDeleteSubEvent"
          @click="onCardClick(se)"
          @toggle-select="toggleSelect(se.id)"
        />
      </template>
    </VueDraggable>

    <!-- Add form with transition -->
    <Transition name="form-slide">
      <SubEventForm
        v-if="showForm"
        :loading="loading"
        :event-date="eventDate"
        :has-ai="hasAi"
        :event-type="eventType"
        @submit="onCreateSubEvent"
        @cancel="onCancelEdit"
      />
    </Transition>

    <ConfirmModal
      v-if="confirmDeleteSubEvent"
      :title="t('dashboard.eventEditor.confirmDeleteSubEvent')"
      :message="confirmDeleteSubEvent.title || ''"
      variant="danger"
      @confirm="doDeleteSubEvent"
      @close="confirmDeleteSubEvent = null"
    />

    <ConfirmModal
      v-if="confirmBulkDelete"
      :title="t('dashboard.eventEditor.confirmBulkDelete', { count: selectedIds.size })"
      :message="t('dashboard.eventEditor.confirmBulkDelete', { count: selectedIds.size })"
      variant="danger"
      @confirm="doBulkDelete"
      @close="confirmBulkDelete = false"
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

.sub-event-list__actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.sub-event-list__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.sub-event-list__select-all {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.sub-event-list__select-all input {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.sub-event-list__selection-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-left: auto;
}

.sub-event-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Toolbar transition */
.toolbar-enter-active,
.toolbar-leave-active {
  transition: all 0.2s ease;
}

.toolbar-enter-from,
.toolbar-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Form slide transition */
.form-slide-enter-active {
  transition: all 0.3s ease;
}

.form-slide-leave-active {
  transition: all 0.2s ease;
}

.form-slide-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.form-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
