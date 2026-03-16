<script setup>
const props = defineProps({
  eventId: { type: [String, Number], required: true },
  eventType: { type: String, default: '' },
  eventTitle: { type: String, default: '' },
  features: { type: Object, default: () => ({}) },
})

const { t } = useI18n()
const { items, loading, saving, stats, fetchItems, fetchStats, createItem, updateItem, deleteItem, bulkDeleteItems } = useWishlist(props.eventId)

const showForm = ref(false)
const editingItem = ref(null)
const selectedIds = ref([])
const showSearch = ref(false)
const showAi = ref(false)
const confirmDeleteId = ref(null)

onMounted(async () => {
  await Promise.all([fetchItems(), fetchStats()])
})

async function handleCreate(data) {
  await createItem(data)
  showForm.value = false
  editingItem.value = null
  await fetchStats()
}

async function handleUpdate(data) {
  if (!editingItem.value) return
  await updateItem(editingItem.value.id, data)
  showForm.value = false
  editingItem.value = null
}

function startEdit(item) {
  editingItem.value = item
  showForm.value = true
}

async function handleDelete(id) {
  await deleteItem(id)
  confirmDeleteId.value = null
  await fetchStats()
}

async function handleBulkDelete() {
  if (selectedIds.value.length === 0) return
  await bulkDeleteItems(selectedIds.value)
  selectedIds.value = []
  await fetchStats()
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

async function handleSearchAdd(productData) {
  await createItem(productData)
  await fetchStats()
}

async function handleAiAdd(suggestionData) {
  await createItem(suggestionData)
  await fetchStats()
}

function cancelForm() {
  showForm.value = false
  editingItem.value = null
}

const claimedPercentage = computed(() => {
  if (!stats.value.totalItems) return 0
  return Math.round((stats.value.claimedItems / stats.value.totalItems) * 100)
})
</script>

<template>
  <div class="editor-wishlist">
    <!-- Stats bar -->
    <div v-if="stats.totalItems > 0" class="editor-wishlist__stats">
      <div class="editor-wishlist__stat">
        <Icon name="lucide:gift" />
        <span>{{ stats.totalItems }} {{ t('wishlist.stats.items') }}</span>
      </div>
      <div class="editor-wishlist__stat">
        <Icon name="lucide:check-circle" />
        <span>{{ stats.claimedItems }} {{ t('wishlist.stats.claimed') }}</span>
      </div>
      <div class="editor-wishlist__progress">
        <div class="editor-wishlist__progress-bar">
          <div class="editor-wishlist__progress-fill" :style="{ width: `${claimedPercentage}%` }" />
        </div>
        <span class="editor-wishlist__progress-label">{{ claimedPercentage }}%</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="editor-wishlist__toolbar">
      <AppButton variant="primary" @click="showForm = true; editingItem = null">
        <Icon name="lucide:plus" />
        {{ t('wishlist.addItem') }}
      </AppButton>
      <AppButton variant="outline" @click="showSearch = !showSearch">
        <Icon name="lucide:search" />
        {{ t('wishlist.searchProducts') }}
      </AppButton>
      <AppButton v-if="features?.aiAssistant" variant="outline" @click="showAi = !showAi">
        <Icon name="lucide:sparkles" />
        {{ t('wishlist.ai.title') }}
      </AppButton>

      <div v-if="selectedIds.length > 0" class="editor-wishlist__bulk">
        <span class="editor-wishlist__bulk-count">{{ selectedIds.length }} {{ t('wishlist.selected') }}</span>
        <AppButton variant="danger" size="sm" @click="handleBulkDelete">
          <Icon name="lucide:trash-2" />
          {{ t('wishlist.bulkDelete') }}
        </AppButton>
      </div>
    </div>

    <!-- Product search panel -->
    <div v-if="showSearch" class="editor-wishlist__search-panel">
      <WishlistSearchBar :event-id="eventId" @add="handleSearchAdd" />
    </div>

    <!-- AI suggest panel -->
    <div v-if="showAi" class="editor-wishlist__ai-panel">
      <WishlistAiSuggest
        :event-id="eventId"
        :event-type="eventType"
        :event-title="eventTitle"
        @add="handleAiAdd"
      />
    </div>

    <!-- Add/Edit form -->
    <Transition name="slide">
      <div v-if="showForm" class="editor-wishlist__form-panel">
        <div class="editor-wishlist__form-header">
          <h3>{{ editingItem ? t('wishlist.editItem') : t('wishlist.addItem') }}</h3>
          <button class="editor-wishlist__close" @click="cancelForm">
            <Icon name="lucide:x" />
          </button>
        </div>
        <WishlistItemForm
          :item="editingItem"
          :saving="saving"
          @submit="editingItem ? handleUpdate($event) : handleCreate($event)"
          @cancel="cancelForm"
        />
      </div>
    </Transition>

    <!-- Items grid -->
    <SkeletonLoader v-if="loading" />
    <div v-else-if="items.length === 0" class="editor-wishlist__empty">
      <Icon name="lucide:gift" class="editor-wishlist__empty-icon" />
      <h3>{{ t('wishlist.emptyTitle') }}</h3>
      <p>{{ t('wishlist.emptyDescription') }}</p>
    </div>
    <WishlistGrid
      v-else
      :items="items"
      mode="organizer"
      :selected-ids="selectedIds"
      @edit="startEdit"
      @delete="(id) => confirmDeleteId = id"
      @select="toggleSelect"
    />

    <!-- Delete confirmation -->
    <ConfirmModal
      v-if="confirmDeleteId"
      :title="t('wishlist.deleteConfirmTitle')"
      :message="t('wishlist.deleteConfirmMessage')"
      variant="danger"
      @confirm="handleDelete(confirmDeleteId)"
      @close="confirmDeleteId = null"
    />
  </div>
</template>

<style scoped>
.editor-wishlist {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.editor-wishlist__stats {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.editor-wishlist__stat {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.editor-wishlist__progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.editor-wishlist__progress-bar {
  width: 120px;
  height: 6px;
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.editor-wishlist__progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.editor-wishlist__progress-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

.editor-wishlist__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.editor-wishlist__bulk {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.editor-wishlist__bulk-count {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.editor-wishlist__search-panel,
.editor-wishlist__ai-panel {
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.editor-wishlist__form-panel {
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-lg);
}

.editor-wishlist__form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.editor-wishlist__form-header h3 {
  font-family: var(--font-family-heading);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.editor-wishlist__close {
  background: none;
  border: none;
  padding: var(--space-1);
  cursor: pointer;
  color: var(--color-text-tertiary);
  border-radius: var(--radius-md);
}

.editor-wishlist__close:hover {
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
}

.editor-wishlist__empty {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-text-tertiary);
}

.editor-wishlist__empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
  opacity: 0.3;
}

.editor-wishlist__empty h3 {
  font-family: var(--font-family-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-2);
}

.editor-wishlist__empty p {
  font-size: var(--text-sm);
  margin: 0;
}

.slide-enter-active {
  transition: all var(--transition-base);
}

.slide-leave-active {
  transition: all var(--transition-fast);
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .editor-wishlist__stats {
    flex-wrap: wrap;
  }

  .editor-wishlist__progress {
    width: 100%;
    margin-left: 0;
  }

  .editor-wishlist__progress-bar {
    flex: 1;
  }
}
</style>
