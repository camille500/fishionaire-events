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
  sectionLabels: {
    type: Object,
    default: () => ({}),
    // { core: 'Core', people: 'People', ... }
  },
})

const emit = defineEmits(['update:modelValue', 'locked-click'])

const { t } = useI18n()
const { staggerIn } = useEditorAnimations()

const navRef = ref(null)
const listRef = ref(null)
const indicatorStyle = ref({ top: '0px', height: '0px' })
const lockedPopoverIndex = ref(null)

function updateIndicator() {
  const container = listRef.value
  if (!container) return
  const buttons = container.querySelectorAll('[role="tab"]')
  const active = buttons[props.modelValue]
  if (!active) return

  indicatorStyle.value = {
    top: `${active.offsetTop}px`,
    height: `${active.offsetHeight}px`,
  }
}

watch(() => props.modelValue, () => nextTick(updateIndicator))
watch(() => props.items.length, () => nextTick(updateIndicator))

onMounted(() => {
  nextTick(() => {
    updateIndicator()
    // Stagger entrance animation
    staggerIn(listRef.value, '.editor-sidebar-nav__item', 0.04)
  })
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(updateIndicator)
    ro.observe(listRef.value)
    onUnmounted(() => ro.disconnect())
  }
})

// Close popover on outside click
function onClickOutside(e) {
  if (lockedPopoverIndex.value !== null) {
    const popover = navRef.value?.querySelector('.editor-sidebar-nav__popover')
    if (popover && !popover.contains(e.target)) {
      lockedPopoverIndex.value = null
    }
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))

// Keyboard navigation
function onKeydown(e) {
  const count = props.items.length
  let newIndex = props.modelValue

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    newIndex = Math.min(newIndex + 1, count - 1)
  } else if (e.key === 'ArrowUp') {
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
    if (props.items[newIndex]?.locked) return
    emit('update:modelValue', newIndex)
    nextTick(() => {
      listRef.value?.querySelectorAll('[role="tab"]')[newIndex]?.focus()
    })
  }
}

function selectTab(index, event) {
  const item = props.items[index]
  if (item?.locked) {
    event.stopPropagation()
    lockedPopoverIndex.value = lockedPopoverIndex.value === index ? null : index
    emit('locked-click', { item, index })
    return
  }
  lockedPopoverIndex.value = null
  emit('update:modelValue', index)
}

// Derive section headers from item.section property
function shouldShowSectionHeader(index) {
  const item = props.items[index]
  if (!item?.section) return false
  if (index === 0) return true
  return item.section !== props.items[index - 1]?.section
}

function getSectionLabel(index) {
  const section = props.items[index]?.section
  if (!section) return ''
  return props.sectionLabels[section] || section
}
</script>

<template>
  <nav ref="navRef" class="editor-sidebar-nav">
    <div ref="listRef" role="tablist" class="editor-sidebar-nav__list" aria-orientation="vertical" @keydown="onKeydown">
      <template v-for="(item, index) in items" :key="item.slot || index">
        <!-- Section header -->
        <div
          v-if="shouldShowSectionHeader(index)"
          class="editor-sidebar-nav__section-header"
        >
          {{ getSectionLabel(index) }}
        </div>

        <!-- Nav item -->
        <button
          type="button"
          role="tab"
          :aria-selected="modelValue === index"
          :aria-disabled="item.locked || undefined"
          :tabindex="modelValue === index ? 0 : -1"
          class="editor-sidebar-nav__item"
          :class="{
            'editor-sidebar-nav__item--active': modelValue === index,
            'editor-sidebar-nav__item--locked': item.locked,
          }"
          @click="selectTab(index, $event)"
        >
          <Icon v-if="item.icon" :name="item.icon.replace('i-lucide-', 'lucide:')" size="16" class="editor-sidebar-nav__icon" />
          <span class="editor-sidebar-nav__label">{{ item.label }}</span>
          <span v-if="item.locked && item.tierBadge" class="editor-sidebar-nav__tier-badge">{{ item.tierBadge }}</span>

          <!-- Locked popover -->
          <Transition name="popover">
            <div
              v-if="item.locked && lockedPopoverIndex === index"
              class="editor-sidebar-nav__popover"
              @click.stop
            >
              <slot name="locked-popover" :item="item" :index="index" />
            </div>
          </Transition>
        </button>
      </template>

      <!-- Sliding active indicator -->
      <div class="editor-sidebar-nav__indicator" :style="indicatorStyle" />
    </div>
  </nav>
</template>

<style scoped>
.editor-sidebar-nav {
  width: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-light) transparent;
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black 8px,
    black calc(100% - 8px),
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black 8px,
    black calc(100% - 8px),
    transparent 100%
  );
}

.editor-sidebar-nav__list {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--space-2) 0;
}

/* Section headers */
.editor-sidebar-nav__section-header {
  padding: var(--space-4) var(--space-3) var(--space-1) var(--space-3);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  user-select: none;
}

.editor-sidebar-nav__section-header:first-child {
  padding-top: var(--space-1);
}

/* Nav items */
.editor-sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  margin: 1px 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
  width: 100%;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
}

.editor-sidebar-nav__item:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.editor-sidebar-nav__item--active {
  background: var(--color-accent-bg);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.editor-sidebar-nav__item--locked {
  opacity: 0.4;
  cursor: pointer;
}

.editor-sidebar-nav__item--locked:hover {
  opacity: 0.6;
}

.editor-sidebar-nav__item:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent-dim);
}

/* Icon */
.editor-sidebar-nav__icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.editor-sidebar-nav__item--active .editor-sidebar-nav__icon {
  opacity: 1;
  color: var(--color-accent);
}

.editor-sidebar-nav__item--locked .editor-sidebar-nav__icon {
  opacity: 0.4;
}

/* Label */
.editor-sidebar-nav__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tier badge */
.editor-sidebar-nav__tier-badge {
  font-size: 0.5625rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
  color: var(--color-text-muted);
  line-height: 1.4;
  flex-shrink: 0;
}

/* Sliding indicator bar */
.editor-sidebar-nav__indicator {
  position: absolute;
  left: 0;
  width: 3px;
  background: var(--color-accent);
  border-radius: 0 2px 2px 0;
  transition: top var(--transition-base), height var(--transition-base);
  z-index: 1;
}

/* Locked popover */
.editor-sidebar-nav__popover {
  position: absolute;
  top: 50%;
  left: calc(100% + 8px);
  transform: translateY(-50%);
  z-index: 50;
  min-width: 320px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-5);
}

.editor-sidebar-nav__popover::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -6px;
  transform: translateY(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

/* Transitions */
.popover-enter-active {
  transition: all 200ms ease-out;
}

.popover-leave-active {
  transition: all 150ms ease-in;
}

.popover-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(-4px);
}

.popover-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .editor-sidebar-nav__item {
    transition: none;
  }

  .editor-sidebar-nav__indicator {
    transition: none;
  }
}
</style>
