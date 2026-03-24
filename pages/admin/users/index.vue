<script setup>
definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const toast = useToast()

const search = ref('')
const roleFilter = ref('')
const page = ref(0)
const limit = 20

let searchTimeout
const debouncedSearch = ref('')
watch(search, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
    page.value = 0
  }, 300)
})

watch(roleFilter, () => { page.value = 0 })

const queryParams = computed(() => ({
  page: page.value,
  limit,
  ...(debouncedSearch.value ? { search: debouncedSearch.value } : {}),
  ...(roleFilter.value ? { role: roleFilter.value } : {}),
}))

const { data, pending, refresh } = await useFetch('/api/admin/users', {
  query: queryParams,
  watch: [queryParams],
})

const totalPages = computed(() => Math.ceil((data.value?.total || 0) / limit))

const columns = computed(() => [
  { key: 'name', label: t('admin.users.name') },
  { key: 'email', label: t('admin.users.email') },
  { key: 'role', label: t('admin.users.role'), width: '120px' },
  { key: 'createdAt', label: t('admin.users.joined'), width: '140px' },
  { key: 'actions', label: '', width: '100px' },
])

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getUserName(row) {
  return [row.firstName, row.lastName].filter(Boolean).join(' ') || row.displayName || '-'
}

// Role change with confirmation modal
const showRoleModal = ref(false)
const roleModalUser = ref(null)
const roleChanging = ref(false)

function promptRoleChange(user) {
  roleModalUser.value = user
  showRoleModal.value = true
}

async function confirmRoleChange() {
  if (!roleModalUser.value) return
  roleChanging.value = true
  const user = roleModalUser.value
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  try {
    await $fetch(`/api/admin/users/${user.clerkId}/role`, {
      method: 'PATCH',
      body: { role: newRole },
    })
    toast.add({ title: t('toast.roleUpdated'), icon: 'i-lucide-check', color: 'green' })
    await refresh()
  } catch {
    toast.add({ title: t('toast.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    roleChanging.value = false
    showRoleModal.value = false
    roleModalUser.value = null
  }
}
</script>

<template>
  <div class="admin-users">
    <div class="admin-users__header">
      <div>
        <AppHeading :level="1">{{ t('admin.users.title') }}</AppHeading>
        <AppText color="muted">{{ t('admin.users.subtitle') }}</AppText>
      </div>
    </div>

    <div class="admin-users__filters">
      <AppInput
        v-model="search"
        :placeholder="t('admin.users.searchPlaceholder')"
        icon="search"
      />
      <select v-model="roleFilter" class="admin-users__select">
        <option value="">{{ t('admin.users.allRoles') }}</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>

    <AdminDataTable :columns="columns" :rows="data?.data || []" :loading="pending">
      <template #cell-name="{ row }">
        <NuxtLink :to="'/admin/users/' + row.clerkId" class="admin-users__name-cell">
          <AvatarCircle
            :src="row.avatarUrl"
            :name="getUserName(row)"
            size="sm"
          />
          <span>{{ getUserName(row) }}</span>
        </NuxtLink>
      </template>

      <template #cell-email="{ row }">
        <AppText size="sm">{{ row.email }}</AppText>
      </template>

      <template #cell-role="{ row }">
        <AppBadge :variant="row.role === 'admin' ? 'accent' : 'default'">
          {{ row.role }}
        </AppBadge>
      </template>

      <template #cell-createdAt="{ row }">
        <AppText size="sm" color="muted">{{ formatDate(row.createdAt) }}</AppText>
      </template>

      <template #cell-actions="{ row }">
        <div class="admin-users__actions">
          <AppButton size="sm" variant="ghost" @click="promptRoleChange(row)">
            {{ row.role === 'admin' ? t('admin.users.demote') : t('admin.users.promote') }}
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
      :visible="showRoleModal"
      :title="roleModalUser?.role === 'admin' ? t('admin.users.demote') : t('admin.users.promote')"
      :message="roleModalUser ? `${getUserName(roleModalUser)} (${roleModalUser.email})` : ''"
      variant="danger"
      :loading="roleChanging"
      @confirm="confirmRoleChange"
      @close="showRoleModal = false"
    />
  </div>
</template>

<style scoped>
.admin-users {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.admin-users__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.admin-users__filters {
  display: flex;
  gap: var(--space-3);
}

.admin-users__filters :deep(.app-input) {
  flex: 1;
  max-width: 320px;
}

.admin-users__select {
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

.admin-users__select:focus {
  border-color: var(--color-accent);
}

.admin-users__name-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: color var(--transition-fast);
}

.admin-users__name-cell:hover {
  color: var(--color-accent);
}

.admin-users__actions {
  display: flex;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .admin-users__filters {
    flex-direction: column;
  }

  .admin-users__filters :deep(.app-input) {
    max-width: none;
  }
}
</style>
