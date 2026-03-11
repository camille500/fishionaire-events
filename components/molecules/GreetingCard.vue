<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="greeting-card">
    <AppHeading :level="2">Welcome</AppHeading>
    <AppText>{{ message }}</AppText>
  </div>
</template>

<style scoped>
.greeting-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
