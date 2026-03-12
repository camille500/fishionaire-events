<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'gradient'].includes(v),
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

const iconSize = computed(() => {
  const sizes = { sm: '14', md: '16', lg: '18' }
  return sizes[props.size]
})

const rippleActive = ref(false)
let rippleTimeout = null

function triggerRipple() {
  if (props.disabled || props.loading) return
  rippleActive.value = true
  clearTimeout(rippleTimeout)
  rippleTimeout = setTimeout(() => {
    rippleActive.value = false
  }, 500)
}
</script>

<template>
  <NuxtLink
    v-if="to && !disabled"
    :to="to"
    class="app-button"
    :class="[
      `app-button--${variant}`,
      `app-button--${size}`,
      { 'app-button--loading': loading, 'app-button--ripple': rippleActive }
    ]"
    @click="triggerRipple"
  >
    <span v-if="loading" class="app-button__spinner" />
    <Icon v-if="icon && !loading" :name="icon" :size="iconSize" />
    <slot />
  </NuxtLink>
  <button
    v-else
    class="app-button"
    :class="[
      `app-button--${variant}`,
      `app-button--${size}`,
      { 'app-button--loading': loading, 'app-button--disabled': disabled, 'app-button--ripple': rippleActive }
    ]"
    :disabled="disabled || loading"
    @click="triggerRipple"
  >
    <span v-if="loading" class="app-button__spinner" />
    <Icon v-if="icon && !loading" :name="icon" :size="iconSize" />
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--transition-base);
  cursor: pointer;
  border: 2px solid transparent;
  line-height: 1;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

.app-button:hover {
  transform: translateY(-2px);
}

.app-button:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 100ms;
}

/* Ripple effect */
.app-button--ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 70%);
  animation: ripple 500ms ease-out forwards;
  pointer-events: none;
}

/* Sizes */
.app-button--sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
}

.app-button--md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
}

.app-button--lg {
  padding: calc(var(--space-3) + 2px) var(--space-8);
  font-size: var(--text-lg);
  border-radius: var(--radius-xl);
}

/* Variants */
.app-button--primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}

.app-button--primary:hover {
  background: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
  box-shadow: var(--shadow-accent);
}

.app-button--gradient {
  background: var(--gradient-accent);
  color: var(--color-text-inverse);
  border-color: transparent;
  background-size: 150% 150%;
}

.app-button--gradient:hover {
  background-position: 100% 50%;
  box-shadow: var(--shadow-accent-lg);
}

.app-button--secondary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.app-button--secondary:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-lg);
}

.app-button--outline {
  background: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.app-button--outline:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}

.app-button--ghost {
  background: transparent;
  color: var(--color-text-primary);
  border-color: transparent;
}

.app-button--ghost:hover {
  background: var(--color-background-alt);
}

/* States */
.app-button--loading {
  pointer-events: none;
  opacity: 0.8;
}

.app-button--disabled {
  pointer-events: none;
  opacity: 0.5;
}

/* Spinner */
.app-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}
</style>
