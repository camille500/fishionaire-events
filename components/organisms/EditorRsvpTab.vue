<script setup>
const { t } = useI18n()
const { form, eventData, canEdit } = useEventEditor()
const { staggerIn } = useEditorAnimations()

const rsvpRef = ref(null)
onMounted(() => {
  nextTick(() => staggerIn(rsvpRef.value, '.editor-rsvp__section'))
})

// RSVP Overview data
const { data: overview, refresh: refreshOverview } = useFetch(
  () => `/api/events/${eventData.value?.id}/rsvp-overview`,
  { lazy: true }
)

// Deadline status
const deadlinePassed = computed(() => {
  if (!form.rsvpDeadline) return false
  return new Date() > new Date(form.rsvpDeadline)
})

const deadlineLabel = computed(() => {
  if (!form.rsvpDeadline) return ''
  const d = new Date(form.rsvpDeadline)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
})

// CSV export
const exporting = ref(false)
async function exportCsv() {
  exporting.value = true
  try {
    const csv = await $fetch(`/api/events/${eventData.value.id}/guests/export`)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guest-list-${eventData.value.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div ref="rsvpRef" class="editor-rsvp">
    <!-- RSVP Settings -->
    <section class="editor-rsvp__section">
      <h3 class="editor-rsvp__section-label">{{ t('editor.rsvp.settingsLabel') }}</h3>

      <div
        class="editor-rsvp__toggle-card"
        :class="{ 'editor-rsvp__toggle-card--active': form.rsvpEnabled }"
      >
        <div class="editor-rsvp__toggle-left">
          <div class="editor-rsvp__toggle-icon">
            <Icon :name="form.rsvpEnabled ? 'lucide:check-circle' : 'lucide:x-circle'" size="16" />
          </div>
          <div class="editor-rsvp__toggle-text">
            <span class="editor-rsvp__toggle-title">{{ t('editor.rsvp.enableLabel') }}</span>
            <span class="editor-rsvp__toggle-desc">{{ t('editor.rsvp.enableDescription') }}</span>
          </div>
        </div>
        <AppSwitch v-model="form.rsvpEnabled" :disabled="!canEdit" />
      </div>

      <!-- Deadline picker -->
      <div v-if="form.rsvpEnabled" class="editor-rsvp__deadline">
        <label class="editor-rsvp__field-label">
          <Icon name="lucide:clock" size="14" />
          {{ t('editor.rsvp.deadlineLabel') }}
        </label>
        <input
          v-model="form.rsvpDeadline"
          type="datetime-local"
          class="editor-rsvp__deadline-input"
          :disabled="!canEdit"
        />
        <span v-if="deadlinePassed && form.rsvpDeadline" class="editor-rsvp__deadline-warning">
          <Icon name="lucide:alert-triangle" size="12" />
          {{ t('editor.rsvp.deadlinePassed') }}
        </span>
        <span v-else-if="form.rsvpDeadline" class="editor-rsvp__deadline-hint">
          {{ deadlineLabel }}
        </span>
      </div>
    </section>

    <!-- RSVP Overview -->
    <section v-if="overview" class="editor-rsvp__section">
      <h3 class="editor-rsvp__section-label">{{ t('editor.rsvp.overviewLabel') }}</h3>

      <!-- Stats cards -->
      <div class="editor-rsvp__stats">
        <div class="editor-rsvp__stat editor-rsvp__stat--invited">
          <span class="editor-rsvp__stat-value">{{ overview.totalInvited }}</span>
          <span class="editor-rsvp__stat-label">{{ t('editor.rsvp.invited') }}</span>
        </div>
        <div class="editor-rsvp__stat editor-rsvp__stat--accepted">
          <span class="editor-rsvp__stat-value">{{ overview.overall.accepted }}</span>
          <span class="editor-rsvp__stat-label">{{ t('editor.rsvp.accepted') }}</span>
        </div>
        <div class="editor-rsvp__stat editor-rsvp__stat--declined">
          <span class="editor-rsvp__stat-value">{{ overview.overall.declined }}</span>
          <span class="editor-rsvp__stat-label">{{ t('editor.rsvp.declined') }}</span>
        </div>
        <div class="editor-rsvp__stat editor-rsvp__stat--pending">
          <span class="editor-rsvp__stat-value">{{ overview.overall.pending }}</span>
          <span class="editor-rsvp__stat-label">{{ t('editor.rsvp.pending') }}</span>
        </div>
      </div>

      <!-- Per sub-event breakdown -->
      <div v-if="overview.subEvents?.length" class="editor-rsvp__breakdown">
        <div
          v-for="se in overview.subEvents"
          :key="se.id"
          class="editor-rsvp__sub-event"
        >
          <div class="editor-rsvp__sub-event-header">
            <span class="editor-rsvp__sub-event-title">{{ se.title }}</span>
            <span class="editor-rsvp__sub-event-total">
              {{ se.counts.accepted + se.counts.declined + se.counts.pending }} {{ t('editor.rsvp.responses') }}
            </span>
          </div>
          <div class="editor-rsvp__sub-event-bar">
            <div
              class="editor-rsvp__bar-segment editor-rsvp__bar-segment--accepted"
              :style="{ flex: se.counts.accepted || 0 }"
            />
            <div
              class="editor-rsvp__bar-segment editor-rsvp__bar-segment--declined"
              :style="{ flex: se.counts.declined || 0 }"
            />
            <div
              class="editor-rsvp__bar-segment editor-rsvp__bar-segment--pending"
              :style="{ flex: se.counts.pending || 0 }"
            />
          </div>
          <div class="editor-rsvp__sub-event-counts">
            <span class="editor-rsvp__count editor-rsvp__count--accepted">{{ se.counts.accepted }} {{ t('editor.rsvp.accepted') }}</span>
            <span class="editor-rsvp__count editor-rsvp__count--declined">{{ se.counts.declined }} {{ t('editor.rsvp.declined') }}</span>
            <span class="editor-rsvp__count editor-rsvp__count--pending">{{ se.counts.pending }} {{ t('editor.rsvp.pending') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Export -->
    <section v-if="canEdit" class="editor-rsvp__section">
      <h3 class="editor-rsvp__section-label">{{ t('editor.rsvp.exportLabel') }}</h3>
      <button class="editor-rsvp__action" :disabled="exporting" @click="exportCsv">
        <div class="editor-rsvp__action-icon">
          <Icon name="lucide:download" size="16" />
        </div>
        <div>
          <span class="editor-rsvp__action-title">{{ t('editor.rsvp.exportCsv') }}</span>
          <span class="editor-rsvp__action-desc">{{ t('editor.rsvp.exportCsvDescription') }}</span>
        </div>
      </button>
    </section>
  </div>
</template>

<style scoped>
.editor-rsvp {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.editor-rsvp__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.editor-rsvp__section-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin: 0;
}

/* Toggle card */
.editor-rsvp__toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition: all var(--transition-fast);
}

.editor-rsvp__toggle-card:hover {
  border-color: var(--color-border);
}

.editor-rsvp__toggle-card--active {
  border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.editor-rsvp__toggle-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.editor-rsvp__toggle-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.editor-rsvp__toggle-card--active .editor-rsvp__toggle-icon {
  background: var(--color-accent-bg);
}

.editor-rsvp__toggle-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.editor-rsvp__toggle-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-rsvp__toggle-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

/* Deadline */
.editor-rsvp__deadline {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.editor-rsvp__field-label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.editor-rsvp__deadline-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
}

.editor-rsvp__deadline-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.editor-rsvp__deadline-warning {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-error);
}

.editor-rsvp__deadline-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Stats */
.editor-rsvp__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.editor-rsvp__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
}

.editor-rsvp__stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.editor-rsvp__stat--accepted .editor-rsvp__stat-value { color: var(--color-success); }
.editor-rsvp__stat--declined .editor-rsvp__stat-value { color: var(--color-error); }
.editor-rsvp__stat--pending .editor-rsvp__stat-value { color: var(--color-warning); }

.editor-rsvp__stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: capitalize;
}

/* Sub-event breakdown */
.editor-rsvp__breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.editor-rsvp__sub-event {
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.editor-rsvp__sub-event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.editor-rsvp__sub-event-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-rsvp__sub-event-total {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.editor-rsvp__sub-event-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--color-border-light);
  margin-bottom: var(--space-2);
}

.editor-rsvp__bar-segment {
  transition: flex var(--transition-normal);
}

.editor-rsvp__bar-segment--accepted { background: var(--color-success); }
.editor-rsvp__bar-segment--declined { background: var(--color-error); }
.editor-rsvp__bar-segment--pending { background: var(--color-warning); }

.editor-rsvp__sub-event-counts {
  display: flex;
  gap: var(--space-4);
}

.editor-rsvp__count {
  font-size: var(--text-xs);
}

.editor-rsvp__count--accepted { color: var(--color-success); }
.editor-rsvp__count--declined { color: var(--color-error); }
.editor-rsvp__count--pending { color: var(--color-warning); }

/* Export action */
.editor-rsvp__action {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all var(--transition-fast);
}

.editor-rsvp__action:hover {
  border-color: var(--color-border);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.editor-rsvp__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-rsvp__action-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.editor-rsvp__action-title {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-rsvp__action-desc {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

@media (max-width: 640px) {
  .editor-rsvp__stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .editor-rsvp__toggle-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .editor-rsvp__sub-event-counts {
    flex-wrap: wrap;
    gap: var(--space-2);
  }
}
</style>
