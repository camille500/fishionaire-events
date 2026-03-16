<script setup>
const props = defineProps({
  token: { type: String, required: true },
})

const { t } = useI18n()
const {
  filteredItems,
  loading,
  claiming,
  activeCategory,
  activePriceRange,
  categories,
  claimedCount,
  myClaimsCount,
  fetchWishlist,
  claimItem,
  unclaimItem,
  markPurchased,
  items,
} = useGuestWishlist(props.token)

const noteError = ref('')

onMounted(() => fetchWishlist())

async function handleClaim(itemId) {
  try {
    await claimItem(itemId)
  } catch (e) {
    if (e.data?.statusCode === 409) {
      await fetchWishlist()
    }
  }
}

async function handleUnclaim(itemId) {
  try {
    await unclaimItem(itemId)
  } catch (e) {
    noteError.value = e.data?.statusMessage || t('wishlist.noteError')
    setTimeout(() => { noteError.value = '' }, 3000)
  }
}

async function handlePurchased(itemId) {
  await markPurchased(itemId)
}

async function handleAddNote(itemId, message) {
  try {
    await claimItem(itemId, { message })
  } catch {
    noteError.value = t('wishlist.noteError')
    setTimeout(() => { noteError.value = '' }, 3000)
  }
}
</script>

<template>
  <div class="guest-wishlist">
    <!-- Summary -->
    <div v-if="items.length > 0 && !loading" class="guest-wishlist__summary">
      <span>{{ items.length }} {{ t('wishlist.stats.items') }}</span>
      <span class="guest-wishlist__dot">·</span>
      <span>{{ claimedCount }} {{ t('wishlist.stats.claimed') }}</span>
      <span v-if="myClaimsCount > 0" class="guest-wishlist__my-claims">
        <span class="guest-wishlist__dot">·</span>
        <Icon name="lucide:heart" />
        {{ myClaimsCount }} {{ t('wishlist.myClaims') }}
      </span>
    </div>

    <!-- Filters -->
    <div v-if="items.length > 0 && !loading" class="guest-wishlist__filters">
      <WishlistCategoryFilter
        v-if="categories.length > 1"
        v-model="activeCategory"
        :categories="categories"
      />
      <WishlistPriceFilter v-model="activePriceRange" />
    </div>

    <!-- Error -->
    <p v-if="noteError" class="guest-wishlist__error">{{ noteError }}</p>

    <!-- Grid -->
    <SkeletonLoader v-if="loading" />
    <div v-else-if="items.length === 0" class="guest-wishlist__empty">
      <Icon name="lucide:gift" class="guest-wishlist__empty-icon" />
      <p>{{ t('wishlist.guestEmpty') }}</p>
    </div>
    <WishlistGrid
      v-else
      :items="filteredItems"
      mode="guest"
      :claiming-id="claiming"
      @claim="handleClaim"
      @unclaim="handleUnclaim"
      @purchased="handlePurchased"
      @add-note="handleAddNote"
    />
  </div>
</template>

<style scoped>
.guest-wishlist {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.guest-wishlist__summary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.guest-wishlist__dot {
  opacity: 0.4;
}

.guest-wishlist__my-claims {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}

.guest-wishlist__filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.guest-wishlist__error {
  font-size: var(--text-sm);
  color: var(--color-error);
  margin: 0;
}

.guest-wishlist__empty {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-tertiary);
}

.guest-wishlist__empty-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-2);
  opacity: 0.3;
}

.guest-wishlist__empty p {
  margin: 0;
  font-size: var(--text-sm);
}
</style>
