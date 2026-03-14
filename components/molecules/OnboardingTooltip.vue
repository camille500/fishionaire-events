<script setup>
const props = defineProps({
  tooltipKey: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'top',
    validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v),
  },
})

const { showTooltip, dismissTooltip } = useOnboarding()

const visible = computed(() => showTooltip(props.tooltipKey))

function dismiss() {
  dismissTooltip(props.tooltipKey)
}
</script>

<template>
  <div class="onboarding-wrapper">
    <slot />
    <Transition name="onboarding">
      <div
        v-if="visible"
        class="onboarding-tip"
        :class="`onboarding-tip--${position}`"
      >
        <div class="onboarding-tip__content">
          <Icon name="lucide:lightbulb" size="14" class="onboarding-tip__icon" />
          <div class="onboarding-tip__text">
            <strong v-if="title" class="onboarding-tip__title">{{ title }}</strong>
            <span class="onboarding-tip__desc">{{ description }}</span>
          </div>
          <button type="button" class="onboarding-tip__close" @click="dismiss">
            <Icon name="lucide:x" size="12" />
          </button>
        </div>
        <div class="onboarding-tip__arrow" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.onboarding-wrapper {
  position: relative;
  display: inline-flex;
}

.onboarding-tip {
  position: absolute;
  z-index: 40;
  pointer-events: auto;
}

.onboarding-tip--top {
  bottom: calc(100% + 8px);
  left: 0;
}

.onboarding-tip--bottom {
  top: calc(100% + 8px);
  left: 0;
}

.onboarding-tip--left {
  right: calc(100% + 8px);
  top: 0;
}

.onboarding-tip--right {
  left: calc(100% + 8px);
  top: 0;
}

.onboarding-tip__content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-accent);
  font-size: var(--text-xs);
  line-height: var(--line-height-normal);
  max-width: 260px;
  white-space: normal;
}

.onboarding-tip__icon {
  flex-shrink: 0;
  margin-top: 1px;
  opacity: 0.85;
}

.onboarding-tip__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.onboarding-tip__title {
  font-weight: var(--font-weight-semibold);
}

.onboarding-tip__desc {
  opacity: 0.9;
}

.onboarding-tip__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  opacity: 0.6;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}

.onboarding-tip__close:hover {
  opacity: 1;
}

.onboarding-tip__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  transform: rotate(45deg);
}

.onboarding-tip--top .onboarding-tip__arrow {
  bottom: -4px;
  left: 16px;
}

.onboarding-tip--bottom .onboarding-tip__arrow {
  top: -4px;
  left: 16px;
}

.onboarding-tip--left .onboarding-tip__arrow {
  right: -4px;
  top: 12px;
}

.onboarding-tip--right .onboarding-tip__arrow {
  left: -4px;
  top: 12px;
}

/* Transitions */
.onboarding-enter-active {
  transition: all 300ms ease-out;
}

.onboarding-leave-active {
  transition: all 200ms ease-in;
}

.onboarding-enter-from,
.onboarding-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
