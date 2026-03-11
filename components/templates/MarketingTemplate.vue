<template>
  <div class="marketing-template">
    <MarketingNav />
    <main class="marketing-template__content">
      <slot />
    </main>
    <MarketingFooter />
  </div>
</template>

<style scoped>
.marketing-template {
  min-height: 100vh;
  background: var(--color-background);
}
</style>
