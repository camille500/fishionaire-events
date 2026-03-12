<script setup>
const props = defineProps({
  trigger: {
    type: Boolean,
    default: false,
  },
  particleCount: {
    type: Number,
    default: 30,
  },
})

const active = ref(false)
const particles = ref([])

const colors = ['#ff6b6b', '#ff9a56', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#2ecc71']

function createParticles() {
  particles.value = Array.from({ length: props.particleCount }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 250 + 100),
    rotate: Math.random() * 720 - 360,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 200,
    duration: Math.random() * 800 + 600,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }))
}

watch(() => props.trigger, (val) => {
  if (val) {
    createParticles()
    active.value = true
    setTimeout(() => {
      active.value = false
      particles.value = []
    }, 1500)
  }
})
</script>

<template>
  <div v-if="active" class="confetti-container" aria-hidden="true">
    <div
      v-for="p in particles"
      :key="p.id"
      class="confetti-particle"
      :class="`confetti-particle--${p.shape}`"
      :style="{
        '--burst-x': p.x + 'px',
        '--burst-y': p.y + 'px',
        '--burst-rotate': p.rotate + 'deg',
        backgroundColor: p.color,
        width: p.size + 'px',
        height: p.shape === 'rect' ? (p.size * 0.4) + 'px' : p.size + 'px',
        animationDelay: p.delay + 'ms',
        animationDuration: p.duration + 'ms',
      }"
    />
  </div>
</template>

<style scoped>
.confetti-container {
  position: fixed;
  top: 50%;
  left: 50%;
  pointer-events: none;
  z-index: 9999;
}

.confetti-particle {
  position: absolute;
  animation: confetti-burst ease-out forwards;
}

.confetti-particle--circle {
  border-radius: 50%;
}

.confetti-particle--rect {
  border-radius: 2px;
}
</style>
