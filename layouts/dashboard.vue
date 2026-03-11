<script setup>
const { collapsed, mobileOpen, toggle, closeMobile } = useSidebar()
</script>

<template>
  <div :class="['dashboard-layout', { 'dashboard-layout--collapsed': collapsed }]">
    <DashboardSidebar
      :collapsed="collapsed"
      :mobile-open="mobileOpen"
      @toggle="toggle"
      @close-mobile="closeMobile"
    />

    <div class="dashboard-layout__main">
      <DashboardHeader @toggle-sidebar="toggle" />

      <main class="dashboard-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
  background: var(--color-background);
  transition: grid-template-columns var(--transition-base);
}

.dashboard-layout--collapsed {
  grid-template-columns: var(--sidebar-width-collapsed) 1fr;
}

.dashboard-layout__main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

.dashboard-layout__content {
  flex: 1;
  padding: var(--space-8);
  max-width: var(--max-width-dashboard);
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-layout,
  .dashboard-layout--collapsed {
    grid-template-columns: 1fr;
  }

  .dashboard-layout__content {
    padding: var(--space-4);
  }
}
</style>
