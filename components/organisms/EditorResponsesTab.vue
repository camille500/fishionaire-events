<script setup>
const { t } = useI18n()
const toast = useToast()
const { form, eventData, canEdit } = useEventEditor()
const { staggerIn } = useEditorAnimations()

const responsesRef = ref(null)
onMounted(() => {
  nextTick(() => staggerIn(responsesRef.value, '.editor-responses__section'))
  checkPollExists()
})

// ── RSVP Overview ──────────────────────
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

// ── Date polling ──────────────────────
const hasDatePolling = computed(() => !!eventData.value?.features?.datePolling)
const datePollingActive = ref(false)
const pollLoading = ref(false)
const pollExists = ref(false)

async function checkPollExists() {
  if (!hasDatePolling.value || !eventData.value?.id) return
  pollLoading.value = true
  try {
    const poll = await $fetch(`/api/events/${eventData.value.id}/date-poll`)
    pollExists.value = !!poll
    datePollingActive.value = !!poll?.isActive
  } catch {
    pollExists.value = false
    datePollingActive.value = false
  } finally {
    pollLoading.value = false
  }
}

async function toggleDatePolling(active) {
  if (!eventData.value?.id) return
  pollLoading.value = true
  try {
    if (active) {
      if (pollExists.value) {
        await $fetch(`/api/events/${eventData.value.id}/date-poll/reopen`, { method: 'POST' })
      } else {
        await $fetch(`/api/events/${eventData.value.id}/date-poll`, { method: 'POST', body: { options: [] } })
        pollExists.value = true
      }
      datePollingActive.value = true
    } else {
      await $fetch(`/api/events/${eventData.value.id}/date-poll/close`, { method: 'POST' })
      datePollingActive.value = false
    }
  } finally {
    pollLoading.value = false
  }
}

// ── Guest response table ──────────────
const guestRows = computed(() => {
  if (!overview.value) return []
  const invitations = overview.value.invitations || []
  return invitations.map(inv => ({
    name: inv.inviteeName || inv.inviteeEmail,
    email: inv.inviteeEmail,
    status: inv.status,
    dietary: inv.dietary || null,
  }))
})

// ── CSV export ──────────────────────
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
    toast.add({ title: t('toast.exportSuccess'), icon: 'i-lucide-check', color: 'green' })
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div ref="responsesRef" class="editor-responses">
    <!-- RSVP Settings -->
    <section v-if="eventData?.features?.rsvp" class="editor-responses__section">
      <h3 class="editor-responses__section-label">{{ t('editor.rsvp.settingsLabel') }}</h3>

      <div
        class="editor-responses__toggle-card"
        :class="{ 'editor-responses__toggle-card--active': form.rsvpEnabled }"
      >
        <div class="editor-responses__toggle-left">
          <div class="editor-responses__toggle-icon">
            <Icon :name="form.rsvpEnabled ? 'lucide:check-circle' : 'lucide:x-circle'" size="16" />
          </div>
          <div class="editor-responses__toggle-text">
            <span class="editor-responses__toggle-title">{{ t('editor.rsvp.enableLabel') }}</span>
            <span class="editor-responses__toggle-desc">{{ t('editor.rsvp.enableDescription') }}</span>
          </div>
        </div>
        <AppSwitch v-model="form.rsvpEnabled" :disabled="!canEdit" />
      </div>

      <!-- Deadline picker -->
      <div v-if="form.rsvpEnabled" class="editor-responses__deadline">
        <label class="editor-responses__field-label">
          <Icon name="lucide:clock" size="14" />
          {{ t('editor.rsvp.deadlineLabel') }}
        </label>
        <input
          v-model="form.rsvpDeadline"
          type="datetime-local"
          class="editor-responses__deadline-input"
          :disabled="!canEdit"
        />
        <span v-if="deadlinePassed && form.rsvpDeadline" class="editor-responses__deadline-warning">
          <Icon name="lucide:alert-triangle" size="12" />
          {{ t('editor.rsvp.deadlinePassed') }}
        </span>
        <span v-else-if="form.rsvpDeadline" class="editor-responses__deadline-hint">
          {{ deadlineLabel }}
        </span>
      </div>
    </section>

    <!-- Date Poll Settings -->
    <section v-if="hasDatePolling" class="editor-responses__section">
      <h3 class="editor-responses__section-label">{{ t('editor.responses.datePollLabel') }}</h3>

      <div
        class="editor-responses__toggle-card"
        :class="{ 'editor-responses__toggle-card--active': datePollingActive }"
      >
        <div class="editor-responses__toggle-left">
          <div class="editor-responses__toggle-icon">
            <Icon :name="datePollingActive ? 'lucide:bar-chart-3' : 'lucide:calendar'" size="16" />
          </div>
          <div class="editor-responses__toggle-text">
            <span class="editor-responses__toggle-title">{{ t('editor.details.datePollingToggle') }}</span>
            <span class="editor-responses__toggle-desc">{{ t('editor.details.datePollingToggleDesc') }}</span>
          </div>
        </div>
        <AppSwitch
          :model-value="datePollingActive"
          :disabled="pollLoading"
          @update:model-value="toggleDatePolling"
        />
      </div>

      <DatePollEditor
        v-if="datePollingActive"
        :event-id="eventData.id"
        :editable="true"
        :locked="false"
      />
    </section>

    <!-- Response Overview -->
    <section v-if="overview" class="editor-responses__section">
      <h3 class="editor-responses__section-label">{{ t('editor.responses.overviewLabel') }}</h3>

      <!-- Stats cards -->
      <div class="editor-responses__stats">
        <div class="editor-responses__stat editor-responses__stat--invited">
          <span class="editor-responses__stat-value">{{ overview.totalInvited }}</span>
          <span class="editor-responses__stat-label">{{ t('editor.rsvp.invited') }}</span>
        </div>
        <div class="editor-responses__stat editor-responses__stat--accepted">
          <span class="editor-responses__stat-value">{{ overview.overall.accepted }}</span>
          <span class="editor-responses__stat-label">{{ t('editor.rsvp.accepted') }}</span>
        </div>
        <div class="editor-responses__stat editor-responses__stat--declined">
          <span class="editor-responses__stat-value">{{ overview.overall.declined }}</span>
          <span class="editor-responses__stat-label">{{ t('editor.rsvp.declined') }}</span>
        </div>
        <div class="editor-responses__stat editor-responses__stat--pending">
          <span class="editor-responses__stat-value">{{ overview.overall.pending }}</span>
          <span class="editor-responses__stat-label">{{ t('editor.rsvp.pending') }}</span>
        </div>
      </div>

      <!-- Per sub-event breakdown -->
      <div v-if="overview.subEvents?.length" class="editor-responses__breakdown">
        <div
          v-for="se in overview.subEvents"
          :key="se.id"
          class="editor-responses__sub-event"
        >
          <div class="editor-responses__sub-event-header">
            <span class="editor-responses__sub-event-title">{{ se.title }}</span>
            <span class="editor-responses__sub-event-total">
              {{ se.counts.accepted + se.counts.declined + se.counts.pending }} {{ t('editor.rsvp.responses') }}
            </span>
          </div>
          <div class="editor-responses__sub-event-bar">
            <div
              class="editor-responses__bar-segment editor-responses__bar-segment--accepted"
              :style="{ flex: se.counts.accepted || 0 }"
            />
            <div
              class="editor-responses__bar-segment editor-responses__bar-segment--declined"
              :style="{ flex: se.counts.declined || 0 }"
            />
            <div
              class="editor-responses__bar-segment editor-responses__bar-segment--pending"
              :style="{ flex: se.counts.pending || 0 }"
            />
          </div>
          <div class="editor-responses__sub-event-counts">
            <span class="editor-responses__count editor-responses__count--accepted">{{ se.counts.accepted }} {{ t('editor.rsvp.accepted') }}</span>
            <span class="editor-responses__count editor-responses__count--declined">{{ se.counts.declined }} {{ t('editor.rsvp.declined') }}</span>
            <span class="editor-responses__count editor-responses__count--pending">{{ se.counts.pending }} {{ t('editor.rsvp.pending') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Guest Response Table -->
    <section v-if="overview" class="editor-responses__section">
      <div class="editor-responses__table-header">
        <h3 class="editor-responses__section-label">{{ t('editor.responses.guestTableLabel') }}</h3>
        <button v-if="canEdit" class="editor-responses__export-btn" :disabled="exporting" @click="exportCsv">
          <Icon name="lucide:download" size="14" />
          {{ t('editor.rsvp.exportCsv') }}
        </button>
      </div>

      <div class="editor-responses__table-wrapper">
        <table class="editor-responses__table">
          <thead>
            <tr>
              <th>{{ t('editor.responses.colName') }}</th>
              <th>{{ t('editor.responses.colEmail') }}</th>
              <th>{{ t('editor.responses.colStatus') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="inv in overview.invitations || []" :key="inv.inviteeEmail">
              <tr>
                <td class="editor-responses__cell-name">{{ inv.inviteeName || '—' }}</td>
                <td class="editor-responses__cell-email">{{ inv.inviteeEmail }}</td>
                <td>
                  <span
                    class="editor-responses__status-badge"
                    :class="`editor-responses__status-badge--${inv.status}`"
                  >
                    <Icon
                      :name="inv.status === 'accepted' ? 'lucide:check' : inv.status === 'declined' ? 'lucide:x' : 'lucide:clock'"
                      size="12"
                    />
                    {{ t(`editor.rsvp.${inv.status}`) }}
                  </span>
                </td>
              </tr>
            </template>
            <tr v-if="!overview.invitations?.length">
              <td colspan="3" class="editor-responses__empty-row">
                {{ t('editor.responses.noGuests') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.editor-responses {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.editor-responses__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.editor-responses__section-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin: 0;
}

/* Toggle card */
.editor-responses__toggle-card {
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

.editor-responses__toggle-card:hover {
  border-color: var(--color-border);
}

.editor-responses__toggle-card--active {
  border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.editor-responses__toggle-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.editor-responses__toggle-icon {
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

.editor-responses__toggle-card--active .editor-responses__toggle-icon {
  background: var(--color-accent-bg);
}

.editor-responses__toggle-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.editor-responses__toggle-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-responses__toggle-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

/* Deadline */
.editor-responses__deadline {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.editor-responses__field-label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.editor-responses__deadline-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
}

.editor-responses__deadline-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.editor-responses__deadline-warning {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-error);
}

.editor-responses__deadline-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Stats */
.editor-responses__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.editor-responses__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
}

.editor-responses__stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.editor-responses__stat--accepted .editor-responses__stat-value { color: var(--color-success); }
.editor-responses__stat--declined .editor-responses__stat-value { color: var(--color-error); }
.editor-responses__stat--pending .editor-responses__stat-value { color: var(--color-warning); }

.editor-responses__stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: capitalize;
}

/* Sub-event breakdown */
.editor-responses__breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.editor-responses__sub-event {
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.editor-responses__sub-event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.editor-responses__sub-event-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-responses__sub-event-total {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.editor-responses__sub-event-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--color-border-light);
  margin-bottom: var(--space-2);
}

.editor-responses__bar-segment {
  transition: flex var(--transition-normal);
}

.editor-responses__bar-segment--accepted { background: var(--color-success); }
.editor-responses__bar-segment--declined { background: var(--color-error); }
.editor-responses__bar-segment--pending { background: var(--color-warning); }

.editor-responses__sub-event-counts {
  display: flex;
  gap: var(--space-4);
}

.editor-responses__count {
  font-size: var(--text-xs);
}

.editor-responses__count--accepted { color: var(--color-success); }
.editor-responses__count--declined { color: var(--color-error); }
.editor-responses__count--pending { color: var(--color-warning); }

/* Guest response table */
.editor-responses__table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.editor-responses__export-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: inherit;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.editor-responses__export-btn:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.editor-responses__export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-responses__table-wrapper {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.editor-responses__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.editor-responses__table thead {
  background: color-mix(in srgb, var(--color-accent) 4%, var(--color-surface));
}

.editor-responses__table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-border-light);
}

.editor-responses__table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
}

.editor-responses__table tbody tr:last-child td {
  border-bottom: none;
}

.editor-responses__table tbody tr:hover {
  background: color-mix(in srgb, var(--color-accent) 2%, transparent);
}

.editor-responses__cell-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editor-responses__cell-email {
  color: var(--color-text-muted);
}

.editor-responses__status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.editor-responses__status-badge--accepted {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}

.editor-responses__status-badge--declined {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}

.editor-responses__status-badge--pending {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.editor-responses__empty-row {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-8) var(--space-4);
}

@media (max-width: 640px) {
  .editor-responses__stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .editor-responses__toggle-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .editor-responses__sub-event-counts {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .editor-responses__table-wrapper {
    overflow-x: auto;
  }
}
</style>
