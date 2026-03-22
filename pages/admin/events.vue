<script setup>
definePageMeta({ layout: 'admin' })

const { t } = useI18n()

const search = ref('')
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

const queryParams = computed(() => ({
  page: page.value,
  limit,
  ...(debouncedSearch.value ? { search: debouncedSearch.value } : {}),
}))

const { data, pending } = await useFetch('/api/admin/events', {
  query: queryParams,
  watch: [queryParams],
})

const totalPages = computed(() => Math.ceil((data.value?.total || 0) / limit))

const columns = computed(() => [
  { key: 'title', label: t('admin.events.eventTitle') },
  { key: 'owner', label: t('admin.events.owner') },
  { key: 'eventType', label: t('admin.events.type'), width: '120px' },
  { key: 'tier', label: t('admin.events.tier'), width: '100px' },
  { key: 'eventDate', label: t('admin.events.date'), width: '140px' },
  { key: 'createdAt', label: t('admin.events.created'), width: '140px' },
])

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

const tierVariant = { free: 'default', standard: 'warning', pro: 'accent' }
</script>

<template>
  <div class="admin-events">
    <div>
      <AppHeading :level="1">{{ t('admin.events.title') }}</AppHeading>
      <AppText color="muted">{{ t('admin.events.subtitle') }}</AppText>
    </div>

    <div class="admin-events__filters">
      <AppInput
        v-model="search"
        :placeholder="t('admin.events.searchPlaceholder')"
        icon="search"
      />
    </div>

    <AdminDataTable :columns="columns" :rows="data?.data || []" :loading="pending">
      <template #cell-title="{ row }">
        <AppText size="sm" weight="medium">{{ row.title }}</AppText>
      </template>

      <template #cell-owner="{ row }">
        <AppText size="sm" color="muted">{{ row.ownerClerkId }}</AppText>
      </template>

      <template #cell-eventType="{ row }">
        <AppBadge v-if="row.eventType" variant="default">{{ row.eventType }}</AppBadge>
        <AppText v-else size="sm" color="muted">-</AppText>
      </template>

      <template #cell-tier="{ row }">
        <AppBadge :variant="tierVariant[row.tier] || 'default'">{{ row.tier }}</AppBadge>
      </template>

      <template #cell-eventDate="{ row }">
        <AppText size="sm" color="muted">{{ formatDate(row.eventDate) }}</AppText>
      </template>

      <template #cell-createdAt="{ row }">
        <AppText size="sm" color="muted">{{ formatDate(row.createdAt) }}</AppText>
      </template>
    </AdminDataTable>

    <PaginationControls
      :page="page"
      :total-pages="totalPages"
      :total="data?.total || 0"
      @update:page="page = $event"
    />
  </div>
</template>

<style scoped>
.admin-events {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.admin-events__filters {
  display: flex;
  gap: var(--space-3);
}

.admin-events__filters :deep(.app-input) {
  flex: 1;
  max-width: 320px;
}

@media (max-width: 768px) {
  .admin-events__filters :deep(.app-input) {
    max-width: none;
  }
}
</style>
