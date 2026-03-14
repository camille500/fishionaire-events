<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue'])

const tabsRef = ref(null)
const indicatorStyle = ref({ left: '0px', width: '0px' })

function updateIndicator() {
  const container = tabsRef.value
  if (!container) return
  const buttons = container.querySelectorAll('[role="tab"]')
  const active = buttons[props.modelValue]
  if (!active) return

  const containerRect = container.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()

  indicatorStyle.value = {
    left: `${activeRect.left - containerRect.left}px`,
    width: `${activeRect.width}px`,
  }
}

watch(() => props.modelValue, () => nextTick(updateIndicator))

onMounted(() => {
  nextTick(updateIndicator)
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(updateIndicator)
    ro.observe(tabsRef.value)
    onUnmounted(() => ro.disconnect())
  }
})

function onKeydown(e) {
  const count = props.items.length
  let newIndex = props.modelValue

  if (e.key === 'ArrowRight') {
    e.preventDefault()
    newIndex = Math.min(newIndex + 1, count - 1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    newIndex = Math.max(newIndex - 1, 0)
  } else if (e.key === 'Home') {
    e.preventDefault()
    newIndex = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    newIndex = count - 1
  }

  if (newIndex !== props.modelValue) {
    emit('update:modelValue', newIndex)
    nextTick(() => {
      tabsRef.value?.querySelectorAll('[role="tab"]')[newIndex]?.focus()
    })
  }
}

function selectTab(index) {
  emit('update:modelValue', index)
}
</script>

<template>
  <div class="app-tabs">
    <!-- Tab bar -->
    <div ref="tabsRef" role="tablist" class="app-tabs__list" @keydown="onKeydown">
      <button
        v-for="(item, index) in items"
        :key="item.slot || index"
        type="button"
        role="tab"
        :aria-selected="modelValue === index"
        :tabindex="modelValue === index ? 0 : -1"
        class="app-tabs__trigger"
        :class="{ 'app-tabs__trigger--active': modelValue === index }"
        @click="selectTab(index)"
      >
        <Icon v-if="item.icon" :name="item.icon.replace('i-lucide-', 'lucide:')" size="15" class="app-tabs__trigger-icon" />
        <span>{{ item.label }}</span>
      </button>

      <!-- Sliding indicator -->
      <div class="app-tabs__indicator" :style="indicatorStyle" />
    </div>

    <!-- Tab panels -->
    <div
      v-for="(item, index) in items"
      :key="item.slot || index"
      v-show="modelValue === index"
      role="tabpanel"
      :aria-hidden="modelValue !== index"
    >
      <slot :name="item.slot || index" />
    </div>
  </div>
</template>

<style scoped>
.app-tabs__list {
  position: relative;
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-border-light);
  overflow-x: auto;
  scrollbar-width: none;
}

.app-tabs__list::-webkit-scrollbar {
  display: none;
}

.app-tabs__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--transition-fast);
  position: relative;
}

.app-tabs__trigger:hover {
  color: var(--color-text-secondary);
}

.app-tabs__trigger--active {
  color: var(--color-text-primary);
}

.app-tabs__trigger:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent-dim);
  border-radius: var(--radius-md);
}

.app-tabs__trigger-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.app-tabs__trigger--active .app-tabs__trigger-icon {
  opacity: 1;
  color: var(--color-accent);
}

/* Sliding underline indicator */
.app-tabs__indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
  transition: left var(--transition-base), width var(--transition-base);
}

@media (prefers-reduced-motion: reduce) {
  .app-tabs__trigger {
    transition: none;
  }

  .app-tabs__indicator {
    transition: none;
  }
}
</style>
