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
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  position: relative;
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
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 184, 148, 0.15);
}

/* Gradient border glow on hover */
.glass-card--hover::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, transparent, rgba(0, 184, 148, 0.3), rgba(108, 92, 231, 0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.glass-card--hover:hover::after {
  opacity: 1;
}
</style>
