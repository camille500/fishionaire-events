<script setup>
defineProps({
  status: {
    type: String,
    default: 'available',
    validator: (v) => ['available', 'claimed', 'purchased', 'pooling', 'funded'].includes(v),
  },
})

const { t } = useI18n()
</script>

<template>
  <span class="wishlist-badge" :class="`wishlist-badge--${status}`">
    <Icon v-if="status === 'available'" name="lucide:circle" class="wishlist-badge__icon" />
    <Icon v-else-if="status === 'claimed'" name="lucide:gift" class="wishlist-badge__icon" />
    <Icon v-else-if="status === 'purchased'" name="lucide:check-circle" class="wishlist-badge__icon" />
    <Icon v-else-if="status === 'pooling'" name="lucide:users" class="wishlist-badge__icon" />
    <Icon v-else-if="status === 'funded'" name="lucide:party-popper" class="wishlist-badge__icon" />
    {{ t(`wishlist.status.${status}`) }}
  </span>
</template>

<style scoped>
.wishlist-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  line-height: 1.5;
  white-space: nowrap;
}

.wishlist-badge__icon {
  width: 12px;
  height: 12px;
}

.wishlist-badge--available {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}

.wishlist-badge--claimed {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.wishlist-badge--purchased {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
}

.wishlist-badge--pooling {
  background: color-mix(in srgb, var(--color-info) 12%, transparent);
  color: var(--color-info);
}

.wishlist-badge--funded {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}
</style>
