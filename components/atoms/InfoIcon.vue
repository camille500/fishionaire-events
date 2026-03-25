<script setup>
const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'top',
    validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v),
  },
  size: {
    type: Number,
    default: 16,
  },
})

const open = ref(false)
const wrapperRef = ref(null)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function handleKeydown(e) {
  if (e.key === 'Escape' && open.value) {
    e.stopPropagation()
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e) {
  if (open.value && wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    close()
  }
}
</script>

<template>
  <span ref="wrapperRef" class="info-icon-wrapper" @keydown="handleKeydown">
    <button
      type="button"
      class="info-icon__trigger"
      :aria-label="title || 'More information'"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <Icon name="lucide:info" :size="size" />
    </button>

    <Transition name="info-popover">
      <div
        v-if="open"
        class="info-popover"
        :class="`info-popover--${position}`"
        role="tooltip"
      >
        <div class="info-popover__content">
          <strong v-if="title" class="info-popover__title">{{ title }}</strong>
          <span class="info-popover__text">{{ content }}</span>
        </div>
        <div class="info-popover__arrow" />
      </div>
    </Transition>
  </span>
</template>

<style scoped>
.info-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.info-icon__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--radius-full);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.info-icon__trigger:hover,
.info-icon__trigger[aria-expanded='true'] {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.info-popover {
  position: absolute;
  z-index: 50;
  pointer-events: auto;
}

.info-popover--top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.info-popover--bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.info-popover--left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.info-popover--right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.info-popover__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  font-size: var(--text-xs);
  line-height: var(--line-height-normal);
  max-width: 260px;
  min-width: 160px;
  white-space: normal;
}

:global(.dark) .info-popover__content {
  background: var(--color-background-alt, #1a1a2e);
  border-color: rgba(255, 255, 255, 0.06);
}

.info-popover__title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.info-popover__text {
  color: var(--color-text-secondary);
}

.info-popover__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  transform: rotate(45deg);
}

:global(.dark) .info-popover__arrow {
  background: var(--color-background-alt, #1a1a2e);
  border-color: rgba(255, 255, 255, 0.06);
}

.info-popover--top .info-popover__arrow {
  bottom: -5px;
  left: 50%;
  margin-left: -4px;
  border-top: none;
  border-left: none;
}

.info-popover--bottom .info-popover__arrow {
  top: -5px;
  left: 50%;
  margin-left: -4px;
  border-bottom: none;
  border-right: none;
}

.info-popover--left .info-popover__arrow {
  right: -5px;
  top: 50%;
  margin-top: -4px;
  border-bottom: none;
  border-left: none;
}

.info-popover--right .info-popover__arrow {
  left: -5px;
  top: 50%;
  margin-top: -4px;
  border-top: none;
  border-right: none;
}

/* Transitions */
.info-popover-enter-active {
  transition: all 200ms ease-out;
}

.info-popover-leave-active {
  transition: all 150ms ease-in;
}

.info-popover-enter-from,
.info-popover-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

.info-popover--bottom.info-popover-enter-from,
.info-popover--bottom.info-popover-leave-to {
  transform: translateX(-50%) translateY(-4px);
}

.info-popover--left.info-popover-enter-from,
.info-popover--left.info-popover-leave-to {
  transform: translateY(-50%) translateX(4px);
}

.info-popover--right.info-popover-enter-from,
.info-popover--right.info-popover-leave-to {
  transform: translateY(-50%) translateX(-4px);
}
</style>
