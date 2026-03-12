<script setup>
defineProps({
  level: {
    type: Number,
    default: 1,
    validator: (v) => [1, 2, 3, 4, 5, 6].includes(v),
  },
  align: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'center', 'right'].includes(v),
  },
  gradient: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <component
    :is="`h${level}`"
    class="app-heading"
    :class="[`app-heading--${align}`, { 'app-heading--gradient': gradient }]"
  >
    <slot />
  </component>
</template>

<style scoped>
.app-heading {
  font-family: var(--font-family-heading);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.app-heading--center { text-align: center; }
.app-heading--right { text-align: right; }

.app-heading--gradient {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
