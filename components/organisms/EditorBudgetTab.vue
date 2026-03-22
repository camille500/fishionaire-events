<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: [Number, String],
    required: true,
  },
  features: {
    type: Object,
    default: () => ({}),
  },
})

const {
  entries, loading, saving, stats,
  spentPercentage, budgetStatus, largestCategory,
  fetchEntries, fetchStats, createEntry, updateEntry, deleteEntry, updateBudgetTarget,
} = useBudget(props.eventId)

const showForm = ref(false)
const editingEntry = ref(null)
const entryToDelete = ref(null)
const editingTarget = ref(false)
const targetInput = ref('')

onMounted(async () => {
  await Promise.all([fetchEntries(), fetchStats()])
})

function startAddExpense() {
  editingEntry.value = null
  showForm.value = true
}

function startEditExpense(entry) {
  editingEntry.value = entry
  showForm.value = true
}

async function handleFormSubmit(data) {
  if (editingEntry.value) {
    await updateEntry(editingEntry.value.id, data)
  } else {
    await createEntry(data)
  }
  showForm.value = false
  editingEntry.value = null
}

function cancelForm() {
  showForm.value = false
  editingEntry.value = null
}

function confirmDelete(entry) {
  entryToDelete.value = entry
}

async function handleDelete() {
  if (entryToDelete.value) {
    await deleteEntry(entryToDelete.value.id)
    entryToDelete.value = null
  }
}

function startEditTarget() {
  targetInput.value = stats.value.budgetTargetCents
    ? (stats.value.budgetTargetCents / 100).toFixed(2)
    : ''
  editingTarget.value = true
}

async function saveTarget() {
  const cents = targetInput.value ? Math.round(parseFloat(targetInput.value) * 100) : null
  await updateBudgetTarget(cents)
  editingTarget.value = false
}
</script>

<template>
  <div class="budget-tab">
    <!-- Budget target -->
    <div class="budget-tab__target">
      <div v-if="!editingTarget" class="budget-tab__target-display" @click="startEditTarget">
        <span v-if="stats.budgetTargetCents" class="budget-tab__target-label">
          {{ t('budget.budgetTarget') }}:
          <strong>{{ new Intl.NumberFormat('nl-NL', { style: 'currency', currency: stats.budgetCurrency }).format(stats.budgetTargetCents / 100) }}</strong>
        </span>
        <span v-else class="budget-tab__target-prompt">{{ t('budget.setBudget') }}</span>
        <Icon name="lucide:pencil" size="14" class="budget-tab__target-edit" />
      </div>
      <div v-else class="budget-tab__target-form">
        <input
          v-model="targetInput"
          type="number"
          step="0.01"
          min="0"
          class="budget-tab__target-input"
          :placeholder="t('budget.budgetTarget')"
          @keyup.enter="saveTarget"
        />
        <AppButton variant="primary" size="sm" :disabled="saving" @click="saveTarget">
          {{ t('budget.form.save') }}
        </AppButton>
        <AppButton variant="ghost" size="sm" @click="editingTarget = false">
          <Icon name="lucide:x" size="14" />
        </AppButton>
      </div>
    </div>

    <!-- Stats bar -->
    <BudgetStatsBar
      v-if="stats.entryCount > 0 || stats.budgetTargetCents"
      :stats="stats"
      :spent-percentage="spentPercentage"
      :budget-status="budgetStatus"
    />

    <!-- Toolbar -->
    <div class="budget-tab__toolbar">
      <AppButton variant="primary" size="sm" @click="startAddExpense">
        <Icon name="lucide:plus" size="14" />
        {{ t('budget.addExpense') }}
      </AppButton>
    </div>

    <!-- Form -->
    <Transition name="slide">
      <BudgetEntryForm
        v-if="showForm"
        :entry="editingEntry"
        :saving="saving"
        @submit="handleFormSubmit"
        @cancel="cancelForm"
      />
    </Transition>

    <!-- Category breakdown -->
    <BudgetCategoryBreakdown
      v-if="stats.categoryBreakdown.length > 0"
      :breakdown="stats.categoryBreakdown"
      :currency="stats.budgetCurrency"
      :total-spent-cents="stats.totalSpentCents"
    />

    <!-- Loading -->
    <div v-if="loading" class="budget-tab__loading">
      <Icon name="lucide:loader-2" size="24" class="budget-tab__spinner" />
    </div>

    <!-- Empty state -->
    <div v-else-if="entries.length === 0 && !showForm" class="budget-tab__empty">
      <Icon name="lucide:wallet" size="32" class="budget-tab__empty-icon" />
      <AppHeading :level="3">{{ t('budget.emptyTitle') }}</AppHeading>
      <AppText size="sm" muted>{{ t('budget.emptyDescription') }}</AppText>
    </div>

    <!-- Entries list -->
    <div v-else class="budget-tab__list">
      <BudgetEntryCard
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        @edit="startEditExpense"
        @delete="confirmDelete"
      />
    </div>

    <!-- Delete confirmation -->
    <ConfirmModal
      v-if="entryToDelete"
      :title="t('budget.deleteConfirmTitle')"
      :message="t('budget.deleteConfirmMessage')"
      @confirm="handleDelete"
      @cancel="entryToDelete = null"
    />
  </div>
</template>

<style scoped>
.budget-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.budget-tab__target {
  display: flex;
  align-items: center;
}

.budget-tab__target-display {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.budget-tab__target-display:hover {
  background: var(--color-background);
}

.budget-tab__target-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.budget-tab__target-prompt {
  font-size: var(--text-sm);
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}

.budget-tab__target-edit {
  color: var(--color-text-muted);
}

.budget-tab__target-form {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.budget-tab__target-input {
  width: 160px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  background: var(--color-background);
}

.budget-tab__target-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.budget-tab__toolbar {
  display: flex;
  gap: var(--space-2);
}

.budget-tab__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.budget-tab__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.budget-tab__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.budget-tab__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.budget-tab__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
  margin-bottom: var(--space-2);
}

.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-base);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
