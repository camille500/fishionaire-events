<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const open = ref(false)
const menuRef = ref(null)
const focusedIndex = ref(-1)

const flatItems = computed(() => {
  const result = []
  props.items.forEach((group, gi) => {
    group.forEach((item) => {
      result.push({ ...item, groupIndex: gi })
    })
  })
  return result
})

function onSelect(item) {
  if (item.onSelect) item.onSelect()
  open.value = false
}

function onKeydown(e) {
  const count = flatItems.value.length
  if (!count) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value + 1) % count
    focusMenuItem()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value - 1 + count) % count
    focusMenuItem()
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (focusedIndex.value >= 0) {
      onSelect(flatItems.value[focusedIndex.value])
    }
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function focusMenuItem() {
  nextTick(() => {
    const items = menuRef.value?.querySelectorAll('[role="menuitem"]')
    items?.[focusedIndex.value]?.focus()
  })
}

watch(open, (val) => {
  if (val) {
    focusedIndex.value = -1
  }
})
</script>

<template>
  <UPopover v-model:open="open">
    <slot />

    <template #content>
      <div
        ref="menuRef"
        role="menu"
        class="app-dropdown"
        @keydown="onKeydown"
      >
        <template v-for="(group, groupIdx) in items" :key="groupIdx">
          <div v-if="groupIdx > 0" class="app-dropdown__separator" />
          <div class="app-dropdown__group">
            <template v-for="item in group" :key="item.label">
              <NuxtLink
                v-if="item.to"
                :to="item.to"
                role="menuitem"
                tabindex="-1"
                class="app-dropdown__item"
                :class="{ 'app-dropdown__item--danger': item.color === 'error' }"
                @click="open = false"
              >
                <Icon v-if="item.icon" :name="item.icon.replace('i-lucide-', 'lucide:')" size="15" class="app-dropdown__item-icon" />
                <span>{{ item.label }}</span>
              </NuxtLink>
              <button
                v-else
                type="button"
                role="menuitem"
                tabindex="-1"
                class="app-dropdown__item"
                :class="{ 'app-dropdown__item--danger': item.color === 'error' }"
                @click="onSelect(item)"
              >
                <Icon v-if="item.icon" :name="item.icon.replace('i-lucide-', 'lucide:')" size="15" class="app-dropdown__item-icon" />
                <span>{{ item.label }}</span>
              </button>
            </template>
          </div>
        </template>
      </div>
    </template>
  </UPopover>
</template>

<style scoped>
.app-dropdown {
  min-width: 180px;
  padding: var(--space-1);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.app-dropdown__group {
  display: flex;
  flex-direction: column;
}

.app-dropdown__separator {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-1) var(--space-2);
}

.app-dropdown__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-normal);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
  width: 100%;
  text-align: left;
}

.app-dropdown__item:hover,
.app-dropdown__item:focus {
  background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
  color: var(--color-text-primary);
  outline: none;
}

.app-dropdown__item--danger {
  color: var(--color-error);
}

.app-dropdown__item--danger:hover,
.app-dropdown__item--danger:focus {
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
  color: var(--color-error);
}

.app-dropdown__item-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.app-dropdown__item:hover .app-dropdown__item-icon,
.app-dropdown__item:focus .app-dropdown__item-icon {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .app-dropdown__item {
    transition: none;
  }
}
</style>
