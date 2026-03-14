<script setup>
import confetti from 'canvas-confetti'

const props = defineProps({
  trigger: {
    type: Boolean,
    default: false,
  },
  particleCount: {
    type: Number,
    default: 80,
  },
})

watch(() => props.trigger, (val) => {
  if (val) {
    const colors = ['#00b894', '#00d4aa', '#6c5ce7', '#7c6bda', '#48dbfb', '#b8860b', '#f4f4f6']

    confetti({
      particleCount: Math.floor(props.particleCount * 0.5),
      spread: 60,
      origin: { y: 0.6 },
      colors,
      scalar: 1.2,
    })

    setTimeout(() => {
      confetti({
        particleCount: Math.floor(props.particleCount * 0.3),
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      })
      confetti({
        particleCount: Math.floor(props.particleCount * 0.3),
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      })
    }, 150)
  }
})
</script>

<template>
  <div />
</template>
