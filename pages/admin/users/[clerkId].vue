<script setup>
definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const route = useRoute()
const clerkId = route.params.clerkId

const { data, pending, refresh } = await useFetch(`/api/admin/users/${clerkId}`)

const user = computed(() => data.value?.user)
const subscription = computed(() => data.value?.subscription)
const events = computed(() => data.value?.events || [])
const purchases = computed(() => data.value?.purchases || [])

function getUserName(u) {
  if (!u) return '-'
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.displayName || u.email
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrency(cents) {
  if (!cents) return '-'
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

// Role change
const confirmingRole = ref(false)

async function toggleRole() {
  if (confirmingRole.value) {
    const newRole = user.value.role === 'admin' ? 'user' : 'admin'
    await $fetch(`/api/admin/users/${clerkId}/role`, {
      method: 'PATCH',
      body: { role: newRole },
    })
    confirmingRole.value = false
    await refresh()
  } else {
    confirmingRole.value = true
  }
}

// Subscription edit
const editingSub = ref(false)
const editTier = ref('')
const editStatus = ref('')

function startEditSub() {
  editTier.value = subscription.value?.tier || 'free'
  editStatus.value = subscription.value?.status || 'active'
  editingSub.value = true
}

async function saveSub() {
  await $fetch(`/api/admin/subscriptions/${clerkId}`, {
    method: 'PATCH',
    body: { tier: editTier.value, status: editStatus.value },
  })
  editingSub.value = false
  await refresh()
}

// Table columns
const eventColumns = [
  { key: 'title', label: t('admin.events.eventTitle') },
  { key: 'eventType', label: t('admin.events.type'), width: '120px' },
  { key: 'tier', label: t('admin.events.tier'), width: '100px' },
  { key: 'eventDate', label: t('admin.events.date'), width: '140px' },
]

const purchaseColumns = [
  { key: 'eventId', label: t('admin.userDetail.eventId'), width: '100px' },
  { key: 'tier', label: t('admin.subscriptions.tier'), width: '100px' },
  { key: 'status', label: t('admin.subscriptions.status'), width: '120px' },
  { key: 'amountCents', label: t('admin.userDetail.amount'), width: '120px' },
  { key: 'createdAt', label: t('admin.events.created'), width: '140px' },
]

const tierVariant = { free: 'default', standard: 'warning', pro: 'accent' }
const statusVariant = { active: 'accent', past_due: 'warning', canceled: 'default', incomplete: 'default', pending: 'default', completed: 'accent', refunded: 'warning', failed: 'default' }
</script>

<template>
  <div v-if="pending" class="user-detail__loading">
    <AppText color="muted">Loading...</AppText>
  </div>

  <div v-else-if="user" class="user-detail">
    <!-- Back link -->
    <NuxtLink to="/admin/users" class="user-detail__back">
      <Icon name="lucide:arrow-left" size="16" />
      {{ t('admin.userDetail.backToUsers') }}
    </NuxtLink>

    <!-- Header -->
    <div class="user-detail__header">
      <div class="user-detail__identity">
        <AvatarCircle
          :src="user.avatarUrl"
          :name="getUserName(user)"
          size="lg"
        />
        <div>
          <AppHeading :level="1">{{ getUserName(user) }}</AppHeading>
          <AppText color="muted">{{ user.email }}</AppText>
          <div class="user-detail__meta">
            <AppBadge :variant="user.role === 'admin' ? 'accent' : 'default'">{{ user.role }}</AppBadge>
            <AppText size="sm" color="muted">{{ t('admin.userDetail.joined') }} {{ formatDate(user.createdAt) }}</AppText>
          </div>
        </div>
      </div>
      <div class="user-detail__header-actions">
        <template v-if="confirmingRole">
          <AppButton size="sm" variant="danger" @click="toggleRole">
            {{ t('admin.confirm') }}
          </AppButton>
          <AppButton size="sm" variant="ghost" @click="confirmingRole = false">
            {{ t('admin.cancel') }}
          </AppButton>
        </template>
        <AppButton v-else size="sm" variant="outline" @click="toggleRole">
          {{ user.role === 'admin' ? t('admin.users.demote') : t('admin.users.promote') }}
        </AppButton>
      </div>
    </div>

    <!-- Profile -->
    <div class="user-detail__section">
      <AppHeading :level="3">{{ t('admin.userDetail.profile') }}</AppHeading>
      <div class="user-detail__card">
        <div class="user-detail__field" v-if="user.bio">
          <AppText size="xs" color="muted">{{ t('admin.userDetail.bio') }}</AppText>
          <AppText size="sm">{{ user.bio }}</AppText>
        </div>
        <div class="user-detail__fields-row">
          <div class="user-detail__field" v-if="user.website">
            <AppText size="xs" color="muted">{{ t('admin.userDetail.website') }}</AppText>
            <AppText size="sm">{{ user.website }}</AppText>
          </div>
          <div class="user-detail__field" v-if="user.socialInstagram">
            <AppText size="xs" color="muted">Instagram</AppText>
            <AppText size="sm">{{ user.socialInstagram }}</AppText>
          </div>
          <div class="user-detail__field" v-if="user.socialTwitter">
            <AppText size="xs" color="muted">Twitter</AppText>
            <AppText size="sm">{{ user.socialTwitter }}</AppText>
          </div>
          <div class="user-detail__field" v-if="user.socialLinkedin">
            <AppText size="xs" color="muted">LinkedIn</AppText>
            <AppText size="sm">{{ user.socialLinkedin }}</AppText>
          </div>
        </div>
        <div
          v-if="!user.bio && !user.website && !user.socialInstagram && !user.socialTwitter && !user.socialLinkedin"
          class="user-detail__empty"
        >
          <AppText size="sm" color="muted">{{ t('admin.userDetail.noProfile') }}</AppText>
        </div>
      </div>
    </div>

    <!-- Subscription -->
    <div class="user-detail__section">
      <div class="user-detail__section-header">
        <AppHeading :level="3">{{ t('admin.userDetail.subscription') }}</AppHeading>
        <AppButton v-if="subscription && !editingSub" size="sm" variant="ghost" @click="startEditSub">
          {{ t('admin.edit') }}
        </AppButton>
      </div>
      <div class="user-detail__card">
        <template v-if="subscription">
          <div class="user-detail__fields-row">
            <div class="user-detail__field">
              <AppText size="xs" color="muted">{{ t('admin.subscriptions.tier') }}</AppText>
              <template v-if="editingSub">
                <select v-model="editTier" class="user-detail__select">
                  <option value="free">Free</option>
                  <option value="standard">Standard</option>
                  <option value="pro">Pro</option>
                </select>
              </template>
              <AppBadge v-else :variant="tierVariant[subscription.tier] || 'default'">{{ subscription.tier }}</AppBadge>
            </div>
            <div class="user-detail__field">
              <AppText size="xs" color="muted">{{ t('admin.subscriptions.status') }}</AppText>
              <template v-if="editingSub">
                <select v-model="editStatus" class="user-detail__select">
                  <option value="active">Active</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </template>
              <AppBadge v-else :variant="statusVariant[subscription.status] || 'default'">{{ subscription.status }}</AppBadge>
            </div>
            <div class="user-detail__field">
              <AppText size="xs" color="muted">{{ t('admin.subscriptions.periodEnd') }}</AppText>
              <AppText size="sm">{{ formatDate(subscription.currentPeriodEnd) }}</AppText>
            </div>
            <div class="user-detail__field" v-if="subscription.stripeCustomerId">
              <AppText size="xs" color="muted">Stripe ID</AppText>
              <AppText size="sm" class="user-detail__mono">{{ subscription.stripeCustomerId }}</AppText>
            </div>
          </div>
          <div v-if="editingSub" class="user-detail__edit-actions">
            <AppButton size="sm" variant="primary" @click="saveSub">{{ t('admin.save') }}</AppButton>
            <AppButton size="sm" variant="ghost" @click="editingSub = false">{{ t('admin.cancel') }}</AppButton>
          </div>
        </template>
        <div v-else class="user-detail__empty">
          <AppText size="sm" color="muted">{{ t('admin.userDetail.noSubscription') }}</AppText>
        </div>
      </div>
    </div>

    <!-- Events -->
    <div class="user-detail__section">
      <AppHeading :level="3">{{ t('admin.userDetail.events') }} ({{ events.length }})</AppHeading>
      <template v-if="events.length">
        <AdminDataTable :columns="eventColumns" :rows="events">
          <template #cell-title="{ row }">
            <AppText size="sm" weight="medium">{{ row.title }}</AppText>
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
        </AdminDataTable>
      </template>
      <div v-else class="user-detail__card">
        <div class="user-detail__empty">
          <AppText size="sm" color="muted">{{ t('admin.userDetail.noEvents') }}</AppText>
        </div>
      </div>
    </div>

    <!-- Purchases -->
    <div class="user-detail__section">
      <AppHeading :level="3">{{ t('admin.userDetail.purchases') }} ({{ purchases.length }})</AppHeading>
      <template v-if="purchases.length">
        <AdminDataTable :columns="purchaseColumns" :rows="purchases">
          <template #cell-eventId="{ row }">
            <AppText size="sm" class="user-detail__mono">#{{ row.eventId }}</AppText>
          </template>
          <template #cell-tier="{ row }">
            <AppBadge :variant="tierVariant[row.tier] || 'default'">{{ row.tier }}</AppBadge>
          </template>
          <template #cell-status="{ row }">
            <AppBadge :variant="statusVariant[row.status] || 'default'">{{ row.status }}</AppBadge>
          </template>
          <template #cell-amountCents="{ row }">
            <AppText size="sm">{{ formatCurrency(row.amountCents) }}</AppText>
          </template>
          <template #cell-createdAt="{ row }">
            <AppText size="sm" color="muted">{{ formatDate(row.createdAt) }}</AppText>
          </template>
        </AdminDataTable>
      </template>
      <div v-else class="user-detail__card">
        <div class="user-detail__empty">
          <AppText size="sm" color="muted">{{ t('admin.userDetail.noPurchases') }}</AppText>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.user-detail__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.user-detail__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: color var(--transition-fast);
}

.user-detail__back:hover {
  color: var(--color-text-primary);
}

.user-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.user-detail__identity {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.user-detail__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.user-detail__header-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.user-detail__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.user-detail__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-detail__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.user-detail__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.user-detail__fields-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-4);
}

.user-detail__mono {
  font-family: monospace;
  font-size: var(--text-xs);
  word-break: break-all;
}

.user-detail__empty {
  text-align: center;
  padding: var(--space-4);
}

.user-detail__select {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  outline: none;
}

.user-detail__select:focus {
  border-color: var(--color-accent);
}

.user-detail__edit-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-light);
}

@media (max-width: 768px) {
  .user-detail__header {
    flex-direction: column;
  }

  .user-detail__identity {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-detail__fields-row {
    grid-template-columns: 1fr;
  }
}
</style>
