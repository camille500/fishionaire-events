<script setup>
const props = defineProps({
  steps: { type: Array, required: true },
  currentStep: { type: Number, required: true },
})

const emit = defineEmits(['goToStep'])
</script>

<template>
  <aside class="wizard-sidebar">
    <nav class="wizard-sidebar__nav">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="wizard-sidebar__step"
        :class="{
          'wizard-sidebar__step--completed': step.completed,
          'wizard-sidebar__step--active': step.active,
          'wizard-sidebar__step--upcoming': !step.completed && !step.active,
        }"
      >
        <!-- Connecting line -->
        <div v-if="index > 0" class="wizard-sidebar__line" :class="{ 'wizard-sidebar__line--filled': step.completed || step.active }" />

        <!-- Step circle -->
        <button
          type="button"
          class="wizard-sidebar__circle"
          :disabled="!step.accessible"
          @click="step.accessible ? emit('goToStep', index) : null"
        >
          <Icon v-if="step.completed" name="lucide:check" size="14" />
          <Icon v-else :name="step.icon" size="14" />
        </button>

        <!-- Step label -->
        <div class="wizard-sidebar__label">
          <span class="wizard-sidebar__title">{{ step.title }}</span>
          <span v-if="step.active" class="wizard-sidebar__desc">{{ step.description }}</span>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.wizard-sidebar {
  width: 240px;
  padding: var(--space-8) var(--space-6);
  border-right: 1px solid var(--color-border-light);
  background: var(--color-surface);
}

.wizard-sidebar__nav {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: var(--space-8);
}

.wizard-sidebar__step {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  position: relative;
  padding-bottom: var(--space-6);
}

.wizard-sidebar__step:last-child {
  padding-bottom: 0;
}

/* Connecting line */
.wizard-sidebar__line {
  position: absolute;
  left: 15px;
  top: -24px;
  width: 2px;
  height: 24px;
  background: var(--color-border-light);
  transition: background var(--transition-base);
}

.wizard-sidebar__line--filled {
  background: var(--color-accent);
}

/* Circle */
.wizard-sidebar__circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-border-light);
  background: var(--color-background);
  color: var(--color-text-muted);
  flex-shrink: 0;
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: var(--font-family);
}

.wizard-sidebar__circle:disabled {
  cursor: default;
}

.wizard-sidebar__step--completed .wizard-sidebar__circle {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}

.wizard-sidebar__step--active .wizard-sidebar__circle {
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  box-shadow: 0 0 0 4px var(--color-accent-dim);
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 4px var(--color-accent-dim); }
  50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--color-accent) 10%, transparent); }
}

.wizard-sidebar__step--upcoming .wizard-sidebar__circle {
  opacity: 0.5;
}

/* Labels */
.wizard-sidebar__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 5px;
}

.wizard-sidebar__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.wizard-sidebar__step--active .wizard-sidebar__title {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.wizard-sidebar__step--upcoming .wizard-sidebar__title {
  color: var(--color-text-muted);
}

.wizard-sidebar__desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}
</style>
