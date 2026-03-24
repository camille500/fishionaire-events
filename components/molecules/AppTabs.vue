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

const wrapperRef = ref(null)
const tabsRef = ref(null)
const indicatorStyle = ref({ left: '0px', width: '0px' })
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const lockedPopoverIndex = ref(null)

function updateIndicator() {
  const container = tabsRef.value
  if (!container) return
  const buttons = container.querySelectorAll('[role="tab"]')
  const active = buttons[props.modelValue]
  if (!active) return

  const containerRect = container.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()

  indicatorStyle.value = {
    left: `${activeRect.left - containerRect.left + container.scrollLeft}px`,
    width: `${activeRect.width}px`,
  }
}

function updateScrollState() {
  const el = tabsRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 2
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 2
}

function scrollTabs(direction) {
  const el = tabsRef.value
  if (!el) return
  el.scrollBy({ left: direction * 160, behavior: 'smooth' })
}

watch(() => props.modelValue, () => nextTick(() => {
  updateIndicator()
  // Scroll active tab into view
  const buttons = tabsRef.value?.querySelectorAll('[role="tab"]')
  buttons?.[props.modelValue]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
}))

onMounted(() => {
  nextTick(() => {
    updateIndicator()
    updateScrollState()
  })
  const el = tabsRef.value
  if (el) {
    el.addEventListener('scroll', () => {
      updateScrollState()
      updateIndicator()
    }, { passive: true })
  }
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      updateIndicator()
      updateScrollState()
    })
    ro.observe(tabsRef.value)
    onUnmounted(() => ro.disconnect())
  }
})

// Close popover on outside click
function onClickOutside(e) {
  if (lockedPopoverIndex.value !== null) {
    const popover = wrapperRef.value?.querySelector('.app-tabs__popover')
    if (popover && !popover.contains(e.target)) {
      lockedPopoverIndex.value = null
    }
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))

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
    // Skip locked tabs
    if (props.items[newIndex]?.locked) return
    emit('update:modelValue', newIndex)
    nextTick(() => {
      tabsRef.value?.querySelectorAll('[role="tab"]')[newIndex]?.focus()
    })
  }
}

function selectTab(index, event) {
  const item = props.items[index]
  if (item?.locked) {
    event.stopPropagation()
    lockedPopoverIndex.value = lockedPopoverIndex.value === index ? null : index
    return
  }
  lockedPopoverIndex.value = null
  emit('update:modelValue', index)
}
</script>

<template>
  <div ref="wrapperRef" class="app-tabs">
    <!-- Tab bar with scroll arrows -->
    <div class="app-tabs__bar">
      <Transition name="fade">
        <button
          v-if="canScrollLeft"
          type="button"
          class="app-tabs__arrow app-tabs__arrow--left"
          aria-hidden="true"
          @click="scrollTabs(-1)"
        >
          <Icon name="lucide:chevron-left" size="16" />
        </button>
      </Transition>

      <div ref="tabsRef" role="tablist" class="app-tabs__list" @keydown="onKeydown">
        <button
          v-for="(item, index) in items"
          :key="item.slot || index"
          type="button"
          role="tab"
          :aria-selected="modelValue === index"
          :aria-disabled="item.locked || undefined"
          :tabindex="modelValue === index ? 0 : -1"
          class="app-tabs__trigger"
          :class="{
            'app-tabs__trigger--active': modelValue === index,
            'app-tabs__trigger--locked': item.locked,
          }"
          @click="selectTab(index, $event)"
        >
          <Icon v-if="item.icon" :name="item.icon.replace('i-lucide-', 'lucide:')" size="15" class="app-tabs__trigger-icon" />
          <span>{{ item.label }}</span>
          <span v-if="item.locked && item.tierBadge" class="app-tabs__tier-badge">{{ item.tierBadge }}</span>

          <!-- Locked popover -->
          <Transition name="popover">
            <div
              v-if="item.locked && lockedPopoverIndex === index"
              class="app-tabs__popover"
              @click.stop
            >
              <slot name="locked-popover" :item="item" :index="index" />
            </div>
          </Transition>
        </button>

        <!-- Sliding indicator -->
        <div class="app-tabs__indicator" :style="indicatorStyle" />
      </div>

      <Transition name="fade">
        <button
          v-if="canScrollRight"
          type="button"
          class="app-tabs__arrow app-tabs__arrow--right"
          aria-hidden="true"
          @click="scrollTabs(1)"
        >
          <Icon name="lucide:chevron-right" size="16" />
        </button>
      </Transition>
    </div>

    <!-- Tab panels -->
    <div
      v-for="(item, index) in items"
      :key="item.slot || index"
      v-show="modelValue === index && !item.locked"
      role="tabpanel"
      :aria-hidden="modelValue !== index"
    >
      <slot :name="item.slot || index" />
    </div>
  </div>
</template>

<style scoped>
.app-tabs__bar {
  position: relative;
  display: flex;
  align-items: stretch;
}

.app-tabs__list {
  position: relative;
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-border-light);
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
  min-width: 0;
}

.app-tabs__list::-webkit-scrollbar {
  display: none;
}

/* Scroll arrows */
.app-tabs__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  flex-shrink: 0;
  border: none;
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 2;
  border-bottom: 1px solid var(--color-border-light);
}

.app-tabs__arrow:hover {
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-text-primary) 4%, var(--color-surface));
}

.app-tabs__arrow--left {
  box-shadow: 4px 0 8px -2px rgba(0, 0, 0, 0.06);
}

.app-tabs__arrow--right {
  box-shadow: -4px 0 8px -2px rgba(0, 0, 0, 0.06);
}

/* Tabs */
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
  transition: color var(--transition-fast), opacity var(--transition-fast);
  position: relative;
}

.app-tabs__trigger:hover {
  color: var(--color-text-secondary);
}

.app-tabs__trigger--active {
  color: var(--color-text-primary);
}

.app-tabs__trigger--locked {
  opacity: 0.4;
  cursor: pointer;
}

.app-tabs__trigger--locked:hover {
  opacity: 0.6;
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

.app-tabs__trigger--locked .app-tabs__trigger-icon {
  opacity: 0.4;
}

/* Tier badge on locked tabs */
.app-tabs__tier-badge {
  font-size: 0.5625rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Locked popover */
.app-tabs__popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  min-width: 320px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-5);
}

.app-tabs__popover::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  border-left: 1px solid var(--color-border-light);
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

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.popover-enter-active {
  transition: all 200ms ease-out;
}

.popover-leave-active {
  transition: all 150ms ease-in;
}

.popover-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.popover-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .app-tabs__trigger {
    transition: none;
  }

  .app-tabs__indicator {
    transition: none;
  }
}

@media (max-width: 640px) {
  .app-tabs__popover {
    min-width: 280px;
    left: 0;
    transform: translateX(0);
  }

  .app-tabs__popover::before {
    left: 24px;
    transform: rotate(45deg);
  }
}
</style>
