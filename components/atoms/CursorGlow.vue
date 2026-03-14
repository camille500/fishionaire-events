<script setup>
const glowRef = ref(null)
let animId = null

onMounted(() => {
  // Only activate on devices with fine pointer (desktop)
  if (!window.matchMedia('(pointer: fine)').matches) return

  const el = glowRef.value
  if (!el) return

  let mouseX = -300
  let mouseY = -300
  let currentX = -300
  let currentY = -300

  function onMouseMove(e) {
    mouseX = e.clientX
    mouseY = e.clientY
  }

  function animate() {
    currentX += (mouseX - currentX) * 0.12
    currentY += (mouseY - currentY) * 0.12
    el.style.transform = `translate(${currentX - 300}px, ${currentY - 300}px)`
    animId = requestAnimationFrame(animate)
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  animId = requestAnimationFrame(animate)

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    if (animId) cancelAnimationFrame(animId)
  })
})
</script>

<template>
  <div ref="glowRef" class="cursor-glow" aria-hidden="true"></div>
</template>

<style scoped>
.cursor-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  opacity: var(--cursor-glow-opacity, 0.4);
  background: radial-gradient(circle, rgba(0, 184, 148, 0.04), transparent 70%);
  will-change: transform;
}
</style>
