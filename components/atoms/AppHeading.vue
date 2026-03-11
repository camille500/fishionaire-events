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
})
</script>

<template>
  <component
    :is="`h${level}`"
    class="app-heading"
    :class="`app-heading--${align}`"
  >
    <slot />
  </component>
</template>

<style scoped>
.app-heading {
  font-family: var(--font-family);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.app-heading--center { text-align: center; }
.app-heading--right { text-align: right; }
</style>
