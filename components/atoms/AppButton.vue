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

const isSubtle = computed(() => ['ghost', 'secondary'].includes(props.variant))
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="[
      'app-button',
      `app-button--${variant}`,
      `app-button--${size}`,
      { 'app-button--subtle': isSubtle },
    ]"
  >
    <Icon v-if="icon && !loading" :name="icon" class="app-button__icon" />
    <span v-if="loading" class="app-button__spinner" />
    <slot />
  </NuxtLink>
  <button
    v-else
    :disabled="disabled || loading"
    :class="[
      'app-button',
      `app-button--${variant}`,
      `app-button--${size}`,
      { 'app-button--subtle': isSubtle, 'app-button--loading': loading },
    ]"
  >
    <Icon v-if="icon && !loading" :name="icon" class="app-button__icon" />
    <span v-if="loading" class="app-button__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  transition: all var(--transition-base);
}

.app-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Sizes */
.app-button--sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  border-radius: var(--radius-md);
}

.app-button--md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

.app-button--lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
}

/* Primary */
.app-button--primary {
  background: var(--color-accent);
  color: #fff;
}

.app-button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent);
  filter: brightness(1.05);
}

.app-button--primary:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  transition-duration: 100ms;
}

/* Secondary */
.app-button--secondary {
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  color: var(--color-text-secondary);
}

.app-button--secondary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
  color: var(--color-text-primary);
}

/* Outline */
.app-button--outline {
  background: transparent;
  color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.app-button--outline:hover:not(:disabled) {
  box-shadow: inset 0 0 0 1px var(--color-accent), var(--shadow-xs);
  background: var(--color-accent-dim);
}

/* Ghost */
.app-button--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.app-button--ghost:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  color: var(--color-text-primary);
}

/* Danger */
.app-button--danger {
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
  color: var(--color-error);
}

.app-button--danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-error) 16%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-error) 30%, transparent);
}

/* Gradient */
.app-button--gradient {
  background: var(--gradient-accent);
  background-size: 200% auto;
  border-color: transparent;
  color: #fff;
}

.app-button--gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  background-position: right center;
  box-shadow: var(--shadow-accent-lg);
}

.app-button--gradient:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  transition-duration: 100ms;
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

/* Icon */
.app-button__icon {
  flex-shrink: 0;
  width: 1em;
  height: 1em;
}

/* Loading spinner */
.app-button__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes shimmer-btn {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .app-button {
    transition: none;
  }

  .app-button:hover:not(:disabled) {
    transform: none;
  }

  .app-button--gradient::before {
    animation: none;
  }

  .app-button__spinner {
    animation-duration: 1.5s;
  }
}
</style>
