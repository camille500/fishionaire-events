<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="dashboard-header">
    <div class="dashboard-header__left">
      <button class="dashboard-header__hamburger" @click="emit('toggle-sidebar')">
        <AppIcon name="menu" size="md" />
      </button>
      <h2 v-if="title" class="dashboard-header__title">{{ title }}</h2>
    </div>
    <div class="dashboard-header__right">
      <slot />
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 30;
}

.dashboard-header__left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.dashboard-header__hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.dashboard-header__hamburger:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.dashboard-header__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.dashboard-header__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 0 var(--space-4);
  }

  .dashboard-header__hamburger {
    display: flex;
  }
}
</style>
