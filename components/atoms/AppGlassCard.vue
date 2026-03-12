<script setup>
defineProps({
  variant: {
    type: String,
    default: 'light',
    validator: (v) => ['light', 'dark'].includes(v),
  },
  padding: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'none'].includes(v),
  },
  hover: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="glass-card"
    :class="[
      `glass-card--${variant}`,
      `glass-card--pad-${padding}`,
      { 'glass-card--hover': hover }
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.glass-card {
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
}

.glass-card--light {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
}

.glass-card--dark {
  background: var(--glass-dark-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-dark-border);
}

.glass-card--pad-none { padding: 0; }
.glass-card--pad-sm { padding: var(--space-4); }
.glass-card--pad-md { padding: var(--space-6); }
.glass-card--pad-lg { padding: var(--space-8); }

.glass-card--hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.glass-card--hover.glass-card--light:hover {
  border-color: rgba(255, 107, 107, 0.2);
}
</style>
