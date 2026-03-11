<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
})

const { collapsed, mobileOpen, toggle, closeMobile } = useSidebar()
</script>

<template>
  <div :class="['dashboard-template', { 'dashboard-template--collapsed': collapsed }]">
    <DashboardSidebar
      :collapsed="collapsed"
      :mobile-open="mobileOpen"
      @toggle="toggle"
      @close-mobile="closeMobile"
    />

    <div class="dashboard-template__main">
      <DashboardHeader :title="title" @toggle-sidebar="toggle">
        <slot name="header-actions" />
      </DashboardHeader>

      <main class="dashboard-template__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-template {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
  background: var(--color-background);
  transition: grid-template-columns var(--transition-base);
}

.dashboard-template--collapsed {
  grid-template-columns: var(--sidebar-width-collapsed) 1fr;
}

.dashboard-template__main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

.dashboard-template__content {
  flex: 1;
  padding: var(--space-8);
  max-width: var(--max-width-dashboard);
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-template,
  .dashboard-template--collapsed {
    grid-template-columns: 1fr;
  }

  .dashboard-template__content {
    padding: var(--space-4);
  }
}
</style>
