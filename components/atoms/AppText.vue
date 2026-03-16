<script setup>
defineProps({
  tag: {
    type: String,
    default: 'p',
  },
  size: {
    type: String,
    default: 'base',
    validator: (v) => ['xs', 'sm', 'base', 'lg'].includes(v),
  },
  align: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'center', 'right'].includes(v),
  },
})
</script>

<template>
  <component
    :is="tag"
    class="app-text"
    :class="[`app-text--${size}`, `app-text--${align}`]"
  >
    <slot />
  </component>
</template>

<style scoped>
.app-text {
  font-family: var(--font-family);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin: 0;
}

.app-text--xs { font-size: var(--text-xs); }
.app-text--sm { font-size: var(--text-sm); }
.app-text--base { font-size: var(--text-base); }
.app-text--lg { font-size: var(--text-lg); }

.app-text--center { text-align: center; }
.app-text--right { text-align: right; }
</style>
