<script setup>
defineProps({
  message: { type: String, default: '' },
  visible: { type: Boolean, default: false },
})
</script>

<template>
  <Transition name="field-error">
    <p v-if="visible && message" class="field-error">
      <Icon name="lucide:alert-circle" size="12" />
      {{ message }}
    </p>
  </Transition>
</template>

<style scoped>
.field-error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin: var(--space-1) 0 0;
  padding: 0;
  font-size: var(--text-xs);
  color: var(--color-error);
  line-height: var(--line-height-normal);
}

.field-error-enter-active {
  transition: all 200ms ease-out;
}

.field-error-leave-active {
  transition: all 150ms ease-in;
}

.field-error-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.field-error-leave-to {
  opacity: 0;
}
</style>
