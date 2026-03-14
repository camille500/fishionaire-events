<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'gradient', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  to: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const buttonProps = computed(() => {
  const map = {
    primary: { color: 'primary', variant: 'solid' },
    secondary: { color: 'neutral', variant: 'soft' },
    outline: { color: 'primary', variant: 'outline' },
    ghost: { color: 'neutral', variant: 'subtle' },
    gradient: { color: 'primary', variant: 'solid' },
    danger: { color: 'error', variant: 'soft' },
  }
  return map[props.variant] || map.primary
})

const isSubtle = computed(() => ['ghost', 'secondary'].includes(props.variant))
</script>

<template>
  <UButton
    :color="buttonProps.color"
    :variant="buttonProps.variant"
    :size="size"
    :to="to || undefined"
    :loading="loading"
    :disabled="disabled"
    :leading-icon="icon || undefined"
    :class="[
      'app-button',
      `app-button--${variant}`,
      { 'app-button--subtle': isSubtle },
    ]"
  >
    <slot />
  </UButton>
</template>

<style scoped>
.app-button {
  border-radius: var(--radius-md) !important;
  position: relative;
  overflow: hidden;
}

/* Solid & gradient: lift on hover */
.app-button--primary,
.app-button--gradient {
  transition: all 0.25s ease;
}

.app-button--primary:hover:not(:disabled),
.app-button--gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent);
}

.app-button--primary:active:not(:disabled),
.app-button--gradient:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  transition-duration: 100ms;
}

/* Outline: subtle lift */
.app-button--outline {
  transition: all 0.2s ease;
}

.app-button--outline:hover:not(:disabled) {
  box-shadow: var(--shadow-xs);
}

/* Subtle variants: no lift, just state change */
.app-button--subtle {
  transition: all 0.15s ease;
}

/* Danger variant */
.app-button--danger {
  transition: all 0.2s ease;
}

.app-button--danger:hover:not(:disabled) {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-error) 30%, transparent);
}

/* Gradient overlay */
.app-button--gradient {
  background: var(--gradient-accent) !important;
  border-color: transparent !important;
  background-size: 200% auto;
  color: #fff !important;
}

.app-button--gradient:hover:not(:disabled) {
  background-position: right center;
  box-shadow: var(--shadow-accent-lg);
}

.app-button--gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.app-button--gradient:hover::before {
  opacity: 1;
  animation: shimmer-btn 1.5s ease infinite;
}

@keyframes shimmer-btn {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
