<script setup>
definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const toast = useToast()

const tierFilter = ref('')
const statusFilter = ref('')
const page = ref(0)
const limit = 20

watch([tierFilter, statusFilter], () => { page.value = 0 })

const queryParams = computed(() => ({
  page: page.value,
  limit,
  ...(tierFilter.value ? { tier: tierFilter.value } : {}),
  ...(statusFilter.value ? { status: statusFilter.value } : {}),
}))

const { data, pending, refresh } = await useFetch('/api/admin/subscriptions', {
  query: queryParams,
  watch: [queryParams],
})

const totalPages = computed(() => Math.ceil((data.value?.total || 0) / limit))

const columns = computed(() => [
  { key: 'user', label: t('admin.subscriptions.user') },
  { key: 'tier', label: t('admin.subscriptions.tier'), width: '120px' },
  { key: 'status', label: t('admin.subscriptions.status'), width: '120px' },
  { key: 'currentPeriodEnd', label: t('admin.subscriptions.periodEnd'), width: '140px' },
  { key: 'actions', label: '', width: '160px' },
])

const editing = ref(null)
const editTier = ref('')
const editStatus = ref('')

function startEdit(row) {
  editing.value = row.userClerkId
  editTier.value = row.tier
  editStatus.value = row.status
}

function cancelEdit() {
  editing.value = null
}

// Save with confirmation modal
const showSaveModal = ref(false)
const savingEdit = ref(false)
const pendingSaveClerkId = ref(null)

function promptSave(userClerkId) {
  pendingSaveClerkId.value = userClerkId
  showSaveModal.value = true
}

async function confirmSave() {
  savingEdit.value = true
  try {
    await $fetch(`/api/admin/subscriptions/${pendingSaveClerkId.value}`, {
      method: 'PATCH',
      body: { tier: editTier.value, status: editStatus.value },
    })
    editing.value = null
    toast.add({ title: t('toast.subscriptionUpdated'), icon: 'i-lucide-check', color: 'green' })
    await refresh()
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    savingEdit.value = false
    showSaveModal.value = false
    pendingSaveClerkId.value = null
  }
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getUserName(user) {
  if (!user) return '-'
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

const tierVariant = { free: 'default', standard: 'warning', pro: 'accent' }
const statusVariant = { active: 'accent', past_due: 'warning', canceled: 'default', incomplete: 'default' }
</script>

<template>
  <div class="admin-subs">
    <div>
      <AppHeading :level="1">{{ t('admin.subscriptions.title') }}</AppHeading>
      <AppText color="muted">{{ t('admin.subscriptions.subtitle') }}</AppText>
    </div>

    <div class="admin-subs__filters">
      <select v-model="tierFilter" class="admin-subs__select">
        <option value="">{{ t('admin.subscriptions.allTiers') }}</option>
        <option value="free">Free</option>
        <option value="standard">Standard</option>
        <option value="pro">Pro</option>
      </select>
      <select v-model="statusFilter" class="admin-subs__select">
        <option value="">{{ t('admin.subscriptions.allStatuses') }}</option>
        <option value="active">Active</option>
        <option value="past_due">Past Due</option>
        <option value="canceled">Canceled</option>
        <option value="incomplete">Incomplete</option>
      </select>
    </div>

    <AdminDataTable :columns="columns" :rows="data?.data || []" :loading="pending">
      <template #cell-user="{ row }">
        <div>
          <AppText size="sm" weight="medium">{{ getUserName(row.user) }}</AppText>
          <AppText size="xs" color="muted">{{ row.user?.email }}</AppText>
        </div>
      </template>

      <template #cell-tier="{ row }">
        <template v-if="editing === row.userClerkId">
          <select v-model="editTier" class="admin-subs__inline-select">
            <option value="free">Free</option>
            <option value="standard">Standard</option>
            <option value="pro">Pro</option>
          </select>
        </template>
        <AppBadge v-else :variant="tierVariant[row.tier] || 'default'">
          {{ row.tier }}
        </AppBadge>
      </template>

      <template #cell-status="{ row }">
        <template v-if="editing === row.userClerkId">
          <select v-model="editStatus" class="admin-subs__inline-select">
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </template>
        <AppBadge v-else :variant="statusVariant[row.status] || 'default'">
          {{ row.status }}
        </AppBadge>
      </template>

      <template #cell-currentPeriodEnd="{ row }">
        <AppText size="sm" color="muted">{{ formatDate(row.currentPeriodEnd) }}</AppText>
      </template>

      <template #cell-actions="{ row }">
        <div class="admin-subs__actions">
          <template v-if="editing === row.userClerkId">
            <AppButton size="sm" variant="primary" @click="promptSave(row.userClerkId)">
              {{ t('admin.save') }}
            </AppButton>
            <AppButton size="sm" variant="ghost" @click="cancelEdit">
              {{ t('admin.cancel') }}
            </AppButton>
          </template>
          <AppButton v-else size="sm" variant="ghost" @click="startEdit(row)">
            {{ t('admin.edit') }}
          </AppButton>
        </div>
      </template>
    </AdminDataTable>

    <PaginationControls
      :page="page"
      :total-pages="totalPages"
      :total="data?.total || 0"
      @update:page="page = $event"
    />

    <ConfirmModal
      :visible="showSaveModal"
      :title="t('admin.subscriptions.confirmSave', 'Save subscription changes')"
      :message="t('admin.subscriptions.confirmSaveMessage', `Tier: ${editTier}, Status: ${editStatus}`)"
      :loading="savingEdit"
      @confirm="confirmSave"
      @close="showSaveModal = false"
    />
  </div>
</template>

<style scoped>
.admin-subs {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.admin-subs__filters {
  display: flex;
  gap: var(--space-3);
}

.admin-subs__select,
.admin-subs__inline-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition-fast);
}

.admin-subs__select:focus,
.admin-subs__inline-select:focus {
  border-color: var(--color-accent);
}

.admin-subs__inline-select {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
}

.admin-subs__actions {
  display: flex;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .admin-subs__filters {
    flex-direction: column;
  }
}
</style>
