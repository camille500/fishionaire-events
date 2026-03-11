<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost'].includes(v),
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
})
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="app-button"
    :class="[`app-button--${variant}`, `app-button--${size}`]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    class="app-button"
    :class="[`app-button--${variant}`, `app-button--${size}`]"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: 2px solid transparent;
  line-height: 1;
}

.app-button:hover {
  transform: translateY(-1px);
}

.app-button:active {
  transform: translateY(0);
}

/* Sizes */
.app-button--sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

.app-button--md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
}

.app-button--lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
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
  box-shadow: var(--shadow-md);
}

.app-button--secondary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.app-button--secondary:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
}

.app-button--outline {
  background: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.app-button--outline:hover {
  border-color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.app-button--ghost {
  background: transparent;
  color: var(--color-text-primary);
  border-color: transparent;
}

.app-button--ghost:hover {
  background: var(--color-background);
}
</style>
