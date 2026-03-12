<script setup>
defineProps({
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
})

const route = useRoute()

const isActive = computed(() => {
  const props_ = getCurrentInstance()?.props
  if (!props_) return false
  return route.path === props_.to || route.path.startsWith(props_.to + '/')
})
</script>

<template>
  <NuxtLink
    v-tooltip="collapsed ? label : undefined"
    :to="to"
    :class="['sidebar-nav-item', { 'sidebar-nav-item--active': isActive, 'sidebar-nav-item--collapsed': collapsed }]"
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
  padding: var(--space-3) var(--space-4);
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
  background: var(--color-background);
  color: var(--color-text-primary);
}

.sidebar-nav-item--active {
  background: var(--color-accent-bg);
  color: var(--color-accent);
}

.sidebar-nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: var(--color-accent);
  border-radius: var(--radius-full);
}

.sidebar-nav-item--collapsed {
  justify-content: center;
  padding: var(--space-3);
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
