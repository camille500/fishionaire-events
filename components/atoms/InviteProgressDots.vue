<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
    // [{ id: string, label: string, icon: string, completed: boolean }]
  },
})
</script>

<template>
  <div v-if="steps.length > 0" class="invite-progress">
    <div
      v-for="step in steps"
      :key="step.id"
      class="invite-progress__dot"
      :class="{ 'invite-progress__dot--completed': step.completed }"
      :title="step.label"
    >
      <Icon :name="step.completed ? 'lucide:check' : step.icon" size="10" />
    </div>
  </div>
</template>

<style scoped>
.invite-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.invite-progress__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.invite-progress__dot--completed {
  border-color: var(--event-accent, var(--color-accent));
  background: var(--event-accent, var(--color-accent));
  color: #fff;
}
</style>
