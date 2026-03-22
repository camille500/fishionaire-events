<script setup>
const { collapsed, mobileOpen, toggle, closeMobile } = useSidebar()
</script>

<template>
  <div :class="['admin-layout', { 'admin-layout--collapsed': collapsed }]">
    <AdminSidebar
      :collapsed="collapsed"
      :mobile-open="mobileOpen"
      @toggle="toggle"
      @close-mobile="closeMobile"
    />

    <div class="admin-layout__main">
      <DashboardHeader @toggle-sidebar="toggle" />

      <main class="admin-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
  background: var(--color-background);
  transition: grid-template-columns var(--transition-base);
}

.admin-layout--collapsed {
  grid-template-columns: var(--sidebar-width-collapsed) 1fr;
}

.admin-layout__main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

.admin-layout__content {
  flex: 1;
  padding: var(--space-8);
  max-width: var(--max-width-dashboard);
  width: 100%;
}

@media (max-width: 768px) {
  .admin-layout,
  .admin-layout--collapsed {
    grid-template-columns: 1fr;
  }

  .admin-layout__content {
    padding: var(--space-4);
  }
}
</style>
