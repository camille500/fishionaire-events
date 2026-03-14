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
        <Icon name="lucide:menu" size="20" />
      </button>
      <h2 v-if="title" class="dashboard-header__title">{{ title }}</h2>
    </div>
    <div class="dashboard-header__right">
      <UColorModeButton />
      <slot />
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 30;
}

.dashboard-header__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.dashboard-header__hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: var(--space-1);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.dashboard-header__hamburger:hover {
  color: var(--color-text-primary);
}

.dashboard-header__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin: 0;
}

.dashboard-header__right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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
