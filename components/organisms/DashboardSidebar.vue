<script setup>
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  mobileOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle', 'close-mobile'])

const { t } = useI18n()
const localePath = useLocalePath()

const navItems = computed(() => [
  { icon: 'home', label: t('dashboard.sidebar.home'), to: localePath('dashboard') },
  { icon: 'calendar', label: t('dashboard.sidebar.events'), to: localePath('dashboard') + '/events' },
  { icon: 'inbox', label: t('dashboard.sidebar.invitations'), to: localePath('dashboard') + '/invitations' },
  { icon: 'settings', label: t('dashboard.sidebar.settings'), to: localePath('dashboard') + '/settings' },
])
</script>

<template>
  <div class="sidebar-wrapper">
    <!-- Mobile backdrop -->
    <Transition name="backdrop">
      <div
        v-if="mobileOpen"
        class="sidebar-backdrop"
        @click="emit('close-mobile')"
      />
    </Transition>

    <aside :class="[
      'sidebar',
      {
        'sidebar--collapsed': collapsed,
        'sidebar--mobile-open': mobileOpen,
      }
    ]">
    <!-- Logo -->
    <div class="sidebar__logo">
      <NuxtLink :to="localePath('index')" class="sidebar__brand">
        <span class="sidebar__brand-icon">🐟</span>
        <Transition name="sidebar-label">
          <span v-show="!collapsed" class="sidebar__brand-text">Fishionaire</span>
        </Transition>
      </NuxtLink>
      <button class="sidebar__toggle" @click="emit('toggle')">
        <AppIcon :name="collapsed ? 'chevron-right' : 'chevron-left'" size="sm" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <SidebarNavItem
        v-for="item in navItems"
        :key="item.to"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
        :badge="item.badge || 0"
        :collapsed="collapsed"
      />
    </nav>

    <!-- Bottom section -->
    <div class="sidebar__bottom">
      <div class="sidebar__divider" />
      <UserMenu :collapsed="collapsed">
        <NuxtLink :to="localePath('dashboard') + '/settings'" class="sidebar__menu-item">
          <AppIcon name="settings" size="sm" />
          <span>{{ t('dashboard.sidebar.settings') }}</span>
        </NuxtLink>
        <NuxtLink :to="localePath('billing')" class="sidebar__menu-item">
          <AppIcon name="wallet" size="sm" />
          <span>{{ t('dashboard.sidebar.billing') }}</span>
        </NuxtLink>
        <button class="sidebar__menu-item sidebar__menu-item--danger" @click="$clerk?.signOut()">
          <AppIcon name="log-out" size="sm" />
          <span>{{ t('dashboard.sidebar.signOut') }}</span>
        </button>
      </UserMenu>
    </div>
  </aside>
  </div>
</template>

<style scoped>
.sidebar-wrapper {
  position: relative;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
}

.sidebar--collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4);
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text-primary);
  overflow: hidden;
}

.sidebar__brand-icon {
  font-size: var(--text-xl);
  flex-shrink: 0;
}

.sidebar__brand-text {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

.sidebar__toggle {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.sidebar__toggle:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.sidebar__nav {
  flex: 1;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
}

.sidebar__bottom {
  padding: var(--space-4);
}

.sidebar__divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: var(--space-4);
}

.sidebar__menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  width: 100%;
  transition: all var(--transition-fast);
}

.sidebar__menu-item:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.sidebar__menu-item--danger:hover {
  color: var(--color-accent);
}

/* Mobile */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 39;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity var(--transition-base);
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.sidebar-label-enter-active,
.sidebar-label-leave-active {
  transition: opacity var(--transition-fast);
}

.sidebar-label-enter-from,
.sidebar-label-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    width: var(--sidebar-width);
    z-index: 41;
  }

  .sidebar--mobile-open {
    transform: translateX(0);
  }

  .sidebar--collapsed {
    width: var(--sidebar-width);
  }

  .sidebar__toggle {
    display: none;
  }
}
</style>
