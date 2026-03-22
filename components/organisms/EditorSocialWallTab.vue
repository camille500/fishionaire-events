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
  autoApprove: {
    type: Boolean,
    default: false,
  },
})

const {
  posts, loading, stats, statusFilter, filteredPosts,
  fetchPosts, fetchStats, approvePost, rejectPost, deletePost, updateSettings,
} = useSocialWall(props.eventId)

const autoApproveEnabled = ref(props.autoApprove)
const postToDelete = ref(null)

onMounted(async () => {
  await Promise.all([fetchPosts(), fetchStats()])
})

async function toggleAutoApprove() {
  autoApproveEnabled.value = !autoApproveEnabled.value
  await updateSettings({ socialWallAutoApprove: autoApproveEnabled.value })
}

function confirmDelete(postId) {
  postToDelete.value = postId
}

async function handleDelete() {
  if (postToDelete.value) {
    await deletePost(postToDelete.value)
    postToDelete.value = null
  }
}

const filterOptions = computed(() => [
  { value: 'all', label: t('socialWall.filterAll'), count: stats.value.total },
  { value: 'pending', label: t('socialWall.filterPending'), count: stats.value.pending },
  { value: 'approved', label: t('socialWall.filterApproved'), count: stats.value.approved },
  { value: 'rejected', label: t('socialWall.filterRejected'), count: stats.value.total - stats.value.pending - stats.value.approved },
])
</script>

<template>
  <div class="social-wall-tab">
    <!-- Stats -->
    <div v-if="stats.total > 0" class="social-wall-tab__stats">
      <div class="social-wall-tab__stat">
        <span class="social-wall-tab__stat-value">{{ stats.total }}</span>
        <span class="social-wall-tab__stat-label">{{ t('socialWall.stats.total') }}</span>
      </div>
      <div class="social-wall-tab__stat social-wall-tab__stat--pending">
        <span class="social-wall-tab__stat-value">{{ stats.pending }}</span>
        <span class="social-wall-tab__stat-label">{{ t('socialWall.stats.pending') }}</span>
      </div>
      <div class="social-wall-tab__stat social-wall-tab__stat--approved">
        <span class="social-wall-tab__stat-value">{{ stats.approved }}</span>
        <span class="social-wall-tab__stat-label">{{ t('socialWall.stats.approved') }}</span>
      </div>
    </div>

    <!-- Settings -->
    <div class="social-wall-tab__settings">
      <label class="social-wall-tab__toggle">
        <input
          type="checkbox"
          :checked="autoApproveEnabled"
          @change="toggleAutoApprove"
        />
        <span class="social-wall-tab__toggle-label">
          {{ t('socialWall.autoApprove') }}
        </span>
      </label>
      <AppText size="xs" muted>{{ t('socialWall.autoApproveDescription') }}</AppText>
    </div>

    <!-- Filters -->
    <div v-if="stats.total > 0" class="social-wall-tab__filters">
      <button
        v-for="opt in filterOptions"
        :key="opt.value"
        class="social-wall-tab__filter"
        :class="{ 'social-wall-tab__filter--active': statusFilter === opt.value }"
        @click="statusFilter = opt.value"
      >
        {{ opt.label }}
        <span v-if="opt.count > 0" class="social-wall-tab__filter-count">{{ opt.count }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="social-wall-tab__loading">
      <Icon name="lucide:loader-2" size="24" class="social-wall-tab__spinner" />
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredPosts.length === 0" class="social-wall-tab__empty">
      <Icon name="lucide:message-circle" size="32" class="social-wall-tab__empty-icon" />
      <AppHeading :level="3">{{ t('socialWall.emptyTitle') }}</AppHeading>
      <AppText size="sm" muted>{{ t('socialWall.emptyDescription') }}</AppText>
    </div>

    <!-- Posts list -->
    <div v-else class="social-wall-tab__list">
      <SocialWallPostCard
        v-for="post in filteredPosts"
        :key="post.id"
        :post="post"
        :show-moderation="true"
        @approve="approvePost"
        @reject="rejectPost"
        @delete="confirmDelete"
      />
    </div>

    <!-- Delete confirmation -->
    <ConfirmModal
      v-if="postToDelete"
      :title="t('socialWall.deleteConfirmTitle')"
      :message="t('socialWall.deleteConfirmMessage')"
      @confirm="handleDelete"
      @cancel="postToDelete = null"
    />
  </div>
</template>

<style scoped>
.social-wall-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.social-wall-tab__stats {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.social-wall-tab__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.social-wall-tab__stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.social-wall-tab__stat--pending .social-wall-tab__stat-value {
  color: var(--color-warning, #f0ad4e);
}

.social-wall-tab__stat--approved .social-wall-tab__stat-value {
  color: var(--color-success, #27ae60);
}

.social-wall-tab__stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.social-wall-tab__settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.social-wall-tab__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.social-wall-tab__toggle input {
  accent-color: var(--color-accent);
}

.social-wall-tab__toggle-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.social-wall-tab__filters {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.social-wall-tab__filter {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border-light);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.social-wall-tab__filter:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.social-wall-tab__filter--active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.social-wall-tab__filter-count {
  font-size: var(--text-xs);
  background: var(--color-border-light);
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
  min-width: 18px;
  text-align: center;
}

.social-wall-tab__filter--active .social-wall-tab__filter-count {
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
}

.social-wall-tab__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.social-wall-tab__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.social-wall-tab__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.social-wall-tab__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
  margin-bottom: var(--space-2);
}

.social-wall-tab__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
