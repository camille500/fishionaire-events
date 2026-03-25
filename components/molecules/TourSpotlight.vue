<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
  totalSteps: {
    type: Number,
    required: true,
  },
  position: {
    type: String,
    default: 'bottom',
    validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v),
  },
  targetRect: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['next', 'prev', 'skip', 'skip-all'])

const { t } = useI18n()

const isFirst = computed(() => props.currentStep === 0)
const isLast = computed(() => props.currentStep === props.totalSteps - 1)

const cardStyle = computed(() => {
  if (!props.targetRect) {
    // Center on screen if no target
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  const rect = props.targetRect
  const padding = 16
  const cardWidth = 320
  const cardHeight = 200
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight

  let pos = props.position

  // Flip if insufficient space
  if (pos === 'bottom' && rect.bottom + padding + cardHeight > viewportH) pos = 'top'
  else if (pos === 'top' && rect.top - padding - cardHeight < 0) pos = 'bottom'
  else if (pos === 'right' && rect.right + padding + cardWidth > viewportW) pos = 'left'
  else if (pos === 'left' && rect.left - padding - cardWidth < 0) pos = 'right'

  const style = { position: 'fixed' }

  if (pos === 'bottom') {
    style.top = `${rect.bottom + padding}px`
    style.left = `${Math.max(16, Math.min(rect.left, viewportW - cardWidth - 16))}px`
  } else if (pos === 'top') {
    style.bottom = `${viewportH - rect.top + padding}px`
    style.left = `${Math.max(16, Math.min(rect.left, viewportW - cardWidth - 16))}px`
  } else if (pos === 'right') {
    style.top = `${Math.max(16, rect.top)}px`
    style.left = `${rect.right + padding}px`
  } else if (pos === 'left') {
    style.top = `${Math.max(16, rect.top)}px`
    style.right = `${viewportW - rect.left + padding}px`
  }

  return style
})
</script>

<template>
  <div class="tour-card" :style="cardStyle">
    <div class="tour-card__header">
      <Icon name="lucide:lightbulb" size="16" class="tour-card__icon" />
      <span class="tour-card__step-label">
        {{ t('tour.stepOf', { current: currentStep + 1, total: totalSteps }) }}
      </span>
    </div>

    <h3 class="tour-card__title">{{ title }}</h3>
    <p class="tour-card__description">{{ description }}</p>

    <TourProgressDots :current="currentStep" :total="totalSteps" />

    <div class="tour-card__actions">
      <AppButton
        v-if="!isFirst"
        variant="ghost"
        size="sm"
        @click="emit('prev')"
      >
        <Icon name="lucide:arrow-left" size="14" />
        {{ t('tour.back') }}
      </AppButton>
      <AppButton
        v-else
        variant="ghost"
        size="sm"
        @click="emit('skip')"
      >
        {{ t('tour.skipStep') }}
      </AppButton>

      <AppButton
        variant="primary"
        size="sm"
        @click="emit('next')"
      >
        {{ isLast ? t('tour.finish') : t('tour.next') }}
        <Icon v-if="!isLast" name="lucide:arrow-right" size="14" />
      </AppButton>
    </div>

    <button type="button" class="tour-card__skip-all" @click="emit('skip-all')">
      {{ t('tour.skipAll') }}
    </button>
  </div>
</template>

<style scoped>
.tour-card {
  width: 320px;
  max-width: calc(100vw - 32px);
  padding: var(--space-5);
  background: var(--glass-bg, rgba(255, 255, 255, 0.92));
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.18));
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  z-index: 10001;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  animation: tour-card-enter 300ms ease-out;
}

:global(.dark) .tour-card {
  background: rgba(20, 20, 30, 0.92);
  border-color: rgba(255, 255, 255, 0.08);
}

.tour-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.tour-card__icon {
  color: var(--color-accent);
}

.tour-card__step-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tour-card__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.tour-card__description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.tour-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.tour-card__skip-all {
  display: block;
  margin: 0 auto;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-1);
  transition: color var(--transition-fast);
}

.tour-card__skip-all:hover {
  color: var(--color-text-primary);
}

@keyframes tour-card-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
