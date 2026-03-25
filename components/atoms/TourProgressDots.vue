<script setup>
defineProps({
  current: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div class="tour-dots" role="group" :aria-label="`Step ${current + 1} of ${total}`">
    <span
      v-for="i in total"
      :key="i"
      :class="['tour-dots__dot', { 'tour-dots__dot--active': i - 1 === current, 'tour-dots__dot--done': i - 1 < current }]"
    />
  </div>
</template>

<style scoped>
.tour-dots {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.tour-dots__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent) 25%, transparent);
  transition: all var(--transition-fast);
}

.tour-dots__dot--active {
  width: 16px;
  background: var(--color-accent);
}

.tour-dots__dot--done {
  background: color-mix(in srgb, var(--color-accent) 60%, transparent);
}
</style>
