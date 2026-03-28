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

const { data: currentUser } = await useFetch('/api/users/me')

const navItems = computed(() => {
  const items = [
    { icon: 'home', label: t('dashboard.sidebar.home'), to: localePath('dashboard'), exact: true },
    { icon: 'user', label: t('dashboard.sidebar.profile'), to: localePath('dashboard') + '/profile' },
    { icon: 'calendar', label: t('dashboard.sidebar.events'), to: localePath('dashboard') + '/events' },
    { icon: 'calendar-check', label: t('dashboard.sidebar.rsvps'), to: localePath('dashboard') + '/rsvps' },
    { icon: 'inbox', label: t('dashboard.sidebar.invitations'), to: localePath('dashboard') + '/invitations' },
    { icon: 'settings', label: t('dashboard.sidebar.settings'), to: localePath('dashboard') + '/settings', tourKey: 'sidebar-settings' },
  ]
  if (currentUser.value?.role === 'admin') {
    items.push({ icon: 'shield', label: t('admin.sidebar.title'), to: '/admin' })
  }
  return items
})

const sidebarHovered = ref(false)
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

    <aside
      :class="[
        'sidebar',
        {
          'sidebar--collapsed': collapsed,
          'sidebar--mobile-open': mobileOpen,
        }
      ]"
      @mouseenter="sidebarHovered = true"
      @mouseleave="sidebarHovered = false"
    >
      <!-- Logo -->
      <div class="sidebar__logo">
        <NuxtLink :to="localePath('index')" class="sidebar__brand">
          <span class="sidebar__brand-icon">🐟</span>
          <Transition name="sidebar-label">
            <span v-show="!collapsed" class="sidebar__brand-text">Fishionaire</span>
          </Transition>
        </NuxtLink>
        <Transition name="fade">
          <button
            v-show="sidebarHovered || collapsed"
            class="sidebar__toggle"
            @click="emit('toggle')"
          >
            <Icon :name="collapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'" size="14" />
          </button>
        </Transition>
      </div>

      <!-- Navigation -->
      <nav class="sidebar__nav" data-tour="sidebar-nav">
        <SidebarNavItem
          v-for="item in navItems"
          :key="item.to"
          :icon="item.icon"
          :label="item.label"
          :to="item.to"
          :badge="item.badge || 0"
          :collapsed="collapsed"
          :exact="item.exact || false"
          :data-tour="item.tourKey || undefined"
        />
      </nav>

      <!-- Bottom section -->
      <div class="sidebar__bottom">
        <div class="sidebar__divider" />
        <UserMenu :collapsed="collapsed">
          <NuxtLink :to="localePath('dashboard') + '/settings'" class="sidebar__menu-item">
            <Icon name="lucide:settings" size="16" />
            <span>{{ t('dashboard.sidebar.settings') }}</span>
          </NuxtLink>
          <NuxtLink :to="localePath('billing')" class="sidebar__menu-item">
            <Icon name="lucide:wallet" size="16" />
            <span>{{ t('dashboard.sidebar.billing') }}</span>
          </NuxtLink>
          <button class="sidebar__menu-item sidebar__menu-item--danger" @click="$clerk?.signOut()">
            <Icon name="lucide:log-out" size="16" />
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
  background: var(--color-background);
  border-right: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
}

:global(.dark) .sidebar {
  background: #0a0a0f;
  border-right-color: rgba(255, 255, 255, 0.06);
}

.sidebar--collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  height: var(--header-height);
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
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.sidebar__toggle:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.sidebar__nav {
  flex: 1;
  padding: var(--space-3) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.sidebar__bottom {
  padding: var(--space-3);
}

.sidebar__divider {
  height: 1px;
  background: var(--color-border-light);
  margin-bottom: var(--space-3);
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
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.sidebar__menu-item--danger:hover {
  color: var(--color-error);
}

/* Mobile */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
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
    background: var(--color-surface);
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
