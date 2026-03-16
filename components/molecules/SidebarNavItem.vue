<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  badge: {
    type: Number,
    default: 0,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  exact: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()

const isActive = computed(() => {
  const path = route.path.replace(/\/$/, '')
  const to = props.to.replace(/\/$/, '')
  if (path === to) return true
  if (props.exact) return false
  return path.startsWith(to + '/')
})
</script>

<template>
  <UTooltip v-if="collapsed" :text="label" :delay-duration="200">
    <NuxtLink
      :to="to"
      :class="['sidebar-nav-item', { 'sidebar-nav-item--active': isActive, 'sidebar-nav-item--collapsed': collapsed }]"
    >
      <Icon :name="'lucide:' + icon" size="16" class="sidebar-nav-item__icon" />
    </NuxtLink>
  </UTooltip>
  <NuxtLink
    v-else
    :to="to"
    :class="['sidebar-nav-item', { 'sidebar-nav-item--active': isActive }]"
  >
    <Icon :name="'lucide:' + icon" size="16" class="sidebar-nav-item__icon" />
    <Transition name="sidebar-label">
      <span v-show="!collapsed" class="sidebar-nav-item__label">{{ label }}</span>
    </Transition>
    <CountBadge
      v-if="badge > 0 && !collapsed"
      :count="badge"
      variant="accent"
      class="sidebar-nav-item__badge"
    />
  </NuxtLink>
</template>

<style scoped>
.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-nav-item:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.sidebar-nav-item--active {
  background: var(--color-accent-bg);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.sidebar-nav-item--collapsed {
  justify-content: center;
  padding: var(--space-2);
}

.sidebar-nav-item__icon {
  flex-shrink: 0;
}

.sidebar-nav-item__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav-item__badge {
  flex-shrink: 0;
}

.sidebar-label-enter-active,
.sidebar-label-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.sidebar-label-enter-from,
.sidebar-label-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
