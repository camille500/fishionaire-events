<script setup>
const scrollProgress = ref(0)

if (import.meta.client) {
  onMounted(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onUnmounted(() => window.removeEventListener('scroll', onScroll))
  })
}
</script>

<template>
  <div class="marketing-template">
    <!-- Global background effects -->
    <AuroraBackground />
    <GridOverlay />
    <ClientOnly>
      <CursorGlow />
      <GSAPAnimations />
    </ClientOnly>

    <div
      class="marketing-template__progress"
      :style="{ width: scrollProgress + '%' }"
    />
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
  background: var(--bg-deep);
  position: relative;
}

.marketing-template__progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--gradient-accent);
  z-index: 200;
  transition: width 50ms linear;
  border-radius: 0 2px 2px 0;
}

.marketing-template__content {
  position: relative;
  z-index: 1;
}
</style>
