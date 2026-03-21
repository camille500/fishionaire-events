<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: { type: Number, required: true },
  editable: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
})

const emit = defineEmits(['upgrade'])

const poll = ref(null)
const loading = ref(false)
const saving = ref(false)
const showDateAdder = ref(false)
const settingDate = ref(false)
const copySuccess = ref(false)

const existingDates = computed(() =>
  (poll.value?.options || []).map(o => o.date)
)

const bestOptionId = computed(() => poll.value?.bestOptionId || null)
const totalVoters = computed(() => {
  if (!poll.value?.options?.length) return 0
  const emails = new Set()
  for (const opt of poll.value.options) {
    for (const voter of opt.voters || []) emails.add(voter.email)
  }
  return emails.size
})

const votingLink = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/poll/${props.eventId}`
})

async function fetchPoll() {
  if (props.locked) return
  loading.value = true
  try {
    poll.value = await $fetch(`/api/events/${props.eventId}/date-poll`)
  } catch {
    poll.value = null
  } finally {
    loading.value = false
  }
}

async function createPoll() {
  saving.value = true
  try {
    poll.value = await $fetch(`/api/events/${props.eventId}/date-poll`, { method: 'POST', body: { options: [] } })
  } finally {
    saving.value = false
  }
}

async function deletePoll() {
  saving.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/date-poll`, { method: 'DELETE' })
    poll.value = null
  } finally {
    saving.value = false
  }
}

function onDatesAdded(updatedPoll) {
  poll.value = updatedPoll
}

async function removeOption(optionId) {
  saving.value = true
  try {
    poll.value = await $fetch(`/api/events/${props.eventId}/date-poll/options/${optionId}`, { method: 'DELETE' })
  } finally {
    saving.value = false
  }
}

async function togglePoll() {
  saving.value = true
  try {
    const endpoint = poll.value.isActive ? 'close' : 'reopen'
    poll.value = await $fetch(`/api/events/${props.eventId}/date-poll/${endpoint}`, { method: 'POST' })
  } finally {
    saving.value = false
  }
}

async function setOfficialDate(optionId) {
  settingDate.value = true
  try {
    await $fetch(`/api/events/${props.eventId}/date-poll/set-date`, {
      method: 'POST',
      body: { optionId },
    })
    await fetchPoll()
  } finally {
    settingDate.value = false
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(votingLink.value)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch {
    // Clipboard not available
  }
}

onMounted(fetchPoll)
</script>

<template>
  <div class="date-poll-editor">
    <div class="date-poll-editor__header">
      <div>
        <AppHeading :level="3" size="sm">{{ t('editor.datePoll.title') }}</AppHeading>
        <AppText size="sm" muted>{{ t('editor.datePoll.subtitle') }}</AppText>
      </div>
    </div>

    <!-- Locked state (free tier) -->
    <EditorEmptySection
      v-if="locked"
      icon="lucide:bar-chart-3"
      :title="t('editor.datePoll.locked.title')"
      :description="t('editor.datePoll.locked.description')"
      :locked="true"
      :upgrade-label="t('editor.datePoll.locked.upgradeCta')"
      @upgrade="emit('upgrade')"
    />

    <!-- Loading -->
    <div v-else-if="loading" class="date-poll-editor__loading">
      <SkeletonLoader height="60px" />
      <SkeletonLoader height="60px" />
    </div>

    <!-- No poll yet -->
    <div v-else-if="!poll" class="date-poll-editor__empty">
      <AppText size="sm" muted>{{ t('editor.datePoll.noPollYet') }}</AppText>
      <AppButton v-if="editable" variant="primary" size="sm" :loading="saving" @click="createPoll">
        <Icon name="lucide:plus" size="14" />
        {{ t('editor.datePoll.createPoll') }}
      </AppButton>
    </div>

    <!-- Poll exists -->
    <template v-else>
      <!-- Status bar -->
      <div class="date-poll-editor__status">
        <AppBadge :color="poll.isActive ? 'green' : 'gray'">
          {{ poll.isActive ? t('editor.datePoll.open') : t('editor.datePoll.closed') }}
        </AppBadge>
        <AppText size="xs" muted>
          {{ totalVoters }} {{ t('editor.datePoll.voters') }}
        </AppText>

        <div class="date-poll-editor__actions" v-if="editable">
          <AppButton variant="ghost" size="sm" @click="copyLink">
            <Icon :name="copySuccess ? 'lucide:check' : 'lucide:link'" size="14" />
            {{ copySuccess ? t('editor.datePoll.linkCopied') : t('editor.datePoll.copyLink') }}
          </AppButton>
          <AppButton variant="ghost" size="sm" :loading="saving" @click="togglePoll">
            {{ poll.isActive ? t('editor.datePoll.closePoll') : t('editor.datePoll.reopenPoll') }}
          </AppButton>
          <AppButton variant="ghost" size="sm" @click="deletePoll">
            <Icon name="lucide:trash-2" size="14" />
          </AppButton>
        </div>
      </div>

      <!-- Options list -->
      <div class="date-poll-editor__options">
        <template v-if="poll.options?.length">
          <div v-for="option in poll.options" :key="option.id" class="date-poll-editor__option-row">
            <!-- Edit mode shows option row + result bar side by side -->
            <DatePollOptionRow
              :option="option"
              mode="results"
              :total-voters="totalVoters"
              :is-winner="option.id === bestOptionId"
            />
            <div v-if="editable && poll.isActive" class="date-poll-editor__option-meta">
              <AppButton
                v-if="option.id === bestOptionId && totalVoters > 0"
                variant="primary"
                size="sm"
                :loading="settingDate"
                @click="setOfficialDate(option.id)"
              >
                <Icon name="lucide:calendar-check" size="14" />
                {{ t('editor.datePoll.setOfficialDate') }}
              </AppButton>
              <button class="date-poll-editor__remove-btn" @click="removeOption(option.id)">
                <Icon name="lucide:x" size="12" />
              </button>
            </div>
          </div>
        </template>

        <div v-else class="date-poll-editor__no-options">
          <AppText size="sm" muted>{{ t('editor.datePoll.noOptions') }}</AppText>
        </div>

        <!-- Date adder panel -->
        <DatePollDateAdder
          v-if="editable && poll.isActive && showDateAdder"
          :event-id="eventId"
          :existing-dates="existingDates"
          @dates-added="onDatesAdded"
          @cancel="showDateAdder = false"
        />

        <AppButton
          v-if="editable && poll.isActive && !showDateAdder"
          variant="ghost"
          size="sm"
          class="date-poll-editor__add-btn"
          @click="showDateAdder = true"
        >
          <Icon name="lucide:plus" size="14" />
          {{ t('editor.datePoll.addDates') }}
        </AppButton>
      </div>

      <!-- Voters breakdown (when there are votes) -->
      <div v-if="totalVoters > 0" class="date-poll-editor__voters">
        <AppText size="xs" muted>{{ t('editor.datePoll.responses') }}</AppText>
        <div class="date-poll-editor__voter-rows">
          <template v-for="opt in poll.options" :key="opt.id">
            <div v-for="voter in opt.voters" :key="`${opt.id}-${voter.email}`" class="date-poll-editor__voter">
              <!-- we deduplicate visually; the best way is to aggregate per voter -->
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.date-poll-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.date-poll-editor__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.date-poll-editor__loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.date-poll-editor__empty {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1.5px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
}

.date-poll-editor__status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.date-poll-editor__actions {
  margin-left: auto;
  display: flex;
  gap: var(--space-1);
}

.date-poll-editor__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.date-poll-editor__option-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-poll-editor__option-row > .date-poll-option {
  flex: 1;
}

.date-poll-editor__option-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.date-poll-editor__remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.date-poll-editor__remove-btn:hover {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}

.date-poll-editor__no-options {
  padding: var(--space-4);
  text-align: center;
  border: 1.5px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
}

.date-poll-editor__add-btn {
  align-self: flex-start;
}

.date-poll-editor__voters {
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
