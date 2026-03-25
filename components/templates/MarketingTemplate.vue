<script setup>
const scrollProgress = ref(0)

if (import.meta.client) {
  onMounted(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onUnmounted(() => window.removeEventListener('scroll', onScroll))
  })
}

const LazyGSAPAnimations = defineAsyncComponent(() => import('~/components/atoms/GSAPAnimations.vue'))
const LazyCursorGlow = defineAsyncComponent(() => import('~/components/atoms/CursorGlow.vue'))
</script>

<template>
  <div class="marketing-template">
    <!-- Global background effects -->
    <AuroraBackground />
    <GridOverlay />
    <ClientOnly>
      <LazyCursorGlow />
      <LazyGSAPAnimations />
    </ClientOnly>

    <div
      class="marketing-template__progress"
      :style="{ width: scrollProgress + '%' }"
    />
    <a href="#main-content" class="skip-link">Skip to content</a>
    <MarketingNav />
    <main id="main-content" class="marketing-template__content">
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
