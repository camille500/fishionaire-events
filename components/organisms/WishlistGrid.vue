<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  mode: { type: String, default: 'guest' },
  selectedIds: { type: Array, default: () => [] },
  claimingId: { type: [String, Number], default: null },
})

const emit = defineEmits(['edit', 'delete', 'claim', 'unclaim', 'purchased', 'select', 'add-note', 'open-chat'])
</script>

<template>
  <div class="wishlist-grid">
    <TransitionGroup name="wishlist-grid-item">
      <WishlistItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :mode="mode"
        :selected="selectedIds.includes(item.id)"
        :claiming="claimingId === item.id"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @claim="emit('claim', $event)"
        @unclaim="emit('unclaim', $event)"
        @purchased="emit('purchased', $event)"
        @select="emit('select', $event)"
        @add-note="(id, msg) => emit('add-note', id, msg)"
        @open-chat="emit('open-chat', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.wishlist-grid-item-enter-active {
  transition: all var(--transition-base);
}

.wishlist-grid-item-leave-active {
  transition: all var(--transition-fast);
}

.wishlist-grid-item-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.wishlist-grid-item-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .wishlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>
