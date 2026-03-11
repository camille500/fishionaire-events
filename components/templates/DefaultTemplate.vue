<template>
  <div class="default-template">
    <main class="default-template__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.default-template {
  min-height: 100vh;
  background: var(--color-background);
}

.default-template__content {
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: var(--space-8);
}
</style>
