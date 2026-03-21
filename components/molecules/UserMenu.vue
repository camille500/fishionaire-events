<script setup>
defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()
const localePath = useLocalePath()
const { user } = useUser()
const { profile } = useProfile()
const menuOpen = ref(false)
const menuRef = ref(null)

onClickOutside(menuRef, () => {
  menuOpen.value = false
})

const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.firstName || user.value.fullName || ''
})

const email = computed(() => {
  return user.value?.primaryEmailAddress?.emailAddress || ''
})

const avatarUrl = computed(() => {
  return profile.value?.avatarUrl || user.value?.imageUrl || null
})

const bioSnippet = computed(() => {
  const bio = profile.value?.bio
  if (!bio) return null
  return bio.length > 60 ? bio.slice(0, 60) + '...' : bio
})
</script>

<template>
  <div ref="menuRef" :class="['user-menu', { 'user-menu--collapsed': collapsed }]">
    <button
      class="user-menu__trigger"
      @click="menuOpen = !menuOpen"
    >
      <AvatarCircle
        :src="avatarUrl"
        :name="displayName"
        size="sm"
        ring
      />
      <div v-show="!collapsed" class="user-menu__info">
        <span class="user-menu__name">{{ displayName }}</span>
        <span class="user-menu__email">{{ email }}</span>
      </div>
      <Icon
        v-show="!collapsed"
        name="lucide:chevron-down"
        size="16"
        :class="['user-menu__chevron', { 'user-menu__chevron--open': menuOpen }]"
      />
    </button>

    <Transition name="menu-dropdown">
      <div v-if="menuOpen" class="user-menu__dropdown">
        <div class="user-menu__dropdown-header">
          <AvatarCircle :src="avatarUrl" :name="displayName" size="md" ring />
          <div class="user-menu__dropdown-info">
            <span class="user-menu__dropdown-name">{{ displayName }}</span>
            <span class="user-menu__dropdown-email">{{ email }}</span>
            <span v-if="bioSnippet" class="user-menu__dropdown-bio">{{ bioSnippet }}</span>
          </div>
        </div>
        <div class="user-menu__dropdown-divider" />
        <div class="user-menu__dropdown-items">
          <NuxtLink :to="localePath('dashboard') + '/profile'" class="user-menu__dropdown-link" @click="menuOpen = false">
            <Icon name="lucide:user" size="16" />
            <span>{{ t('dashboard.sidebar.viewProfile') }}</span>
          </NuxtLink>
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu__trigger {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: inherit;
  font: inherit;
  width: 100%;
  transition: background var(--transition-fast);
}

.user-menu__trigger:hover {
  background: var(--color-background);
}

.user-menu--collapsed .user-menu__trigger {
  justify-content: center;
  padding: var(--space-2);
}

.user-menu__info {
  flex: 1;
  min-width: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.user-menu__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__email {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__chevron {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.user-menu__chevron--open {
  transform: rotate(180deg);
}

.user-menu__dropdown {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  min-width: 220px;
  background: var(--color-surface-elevated, var(--color-surface));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  overflow: hidden;
}

.user-menu__dropdown-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
}

.user-menu__dropdown-info {
  flex: 1;
  min-width: 0;
}

.user-menu__dropdown-name {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.user-menu__dropdown-email {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__dropdown-bio {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
  line-height: var(--line-height-normal);
}

.user-menu__dropdown-divider {
  height: 1px;
  background: var(--color-border);
}

.user-menu__dropdown-items {
  padding: var(--space-2);
}

.user-menu__dropdown-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.user-menu__dropdown-link:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.menu-dropdown-enter-active,
.menu-dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.menu-dropdown-enter-from,
.menu-dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
