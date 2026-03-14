<template></template>

<script setup>
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()
const cleanupFns = []
let removeAfterEach = null

function addCleanup(fn) {
  cleanupFns.push(fn)
}

function cleanup() {
  while (cleanupFns.length) {
    const fn = cleanupFns.pop()
    fn?.()
  }
  ScrollTrigger.getAll().forEach(t => t.kill())
}

function isBelowFold(el) {
  const rect = el.getBoundingClientRect()
  return rect.top >= window.innerHeight + 200
}

async function init() {
  cleanup()

  try {
    await new Promise(r => requestAnimationFrame(r))

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // --- REVEAL ANIMATIONS ---
    gsap.utils.toArray('.reveal').forEach((el) => {
      if (reducedMotion) return
      if (!isBelowFold(el)) return

      gsap.set(el, { opacity: 0, y: 40 })
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    })

    if (reducedMotion) return

    // --- STAGGERED GRID REVEALS ---
    document.querySelectorAll('.reveal-grid').forEach(grid => {
      if (!isBelowFold(grid)) return
      const cards = grid.children
      if (!cards.length) return
      gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 })
      gsap.to(cards, {
        opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
      })
    })

    // --- PARALLAX HERO ---
    const heroVisual = document.querySelector('.hero-visual')
    if (heroVisual) {
      gsap.to(heroVisual, {
        y: 120, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
      })
    }

    const heroContent = document.querySelector('.hero-content')
    if (heroContent) {
      gsap.to(heroContent, {
        y: 50, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
      })
    }

    // --- ANIMATED COUNTERS ---
    document.querySelectorAll('[data-counter-value]').forEach(el => {
      const target = parseFloat(el.getAttribute('data-counter-value') || '0')
      const suffix = el.getAttribute('data-counter-suffix') || ''
      const prefix = el.getAttribute('data-counter-prefix') || ''
      const duration = parseFloat(el.getAttribute('data-counter-duration') || '2')
      const counter = { val: 0 }
      gsap.to(counter, {
        val: target, duration, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate() {
          const display = target % 1 === 0 ? Math.round(counter.val) : counter.val.toFixed(1)
          el.textContent = prefix + display + suffix
        },
      })
    })

    // --- 3D TILT ON CARDS ---
    document.querySelectorAll('.tilt-card').forEach(card => {
      const el = card
      const onMouseMove = (e) => {
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        gsap.to(el, {
          rotateY: x * 8,
          rotateX: -y * 8,
          transformPerspective: 800,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
      const onMouseLeave = () => {
        gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.out' })
      }
      el.addEventListener('mousemove', onMouseMove)
      el.addEventListener('mouseleave', onMouseLeave)
      addCleanup(() => {
        el.removeEventListener('mousemove', onMouseMove)
        el.removeEventListener('mouseleave', onMouseLeave)
      })
    })

    // --- MAGNETIC BUTTONS ---
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      const el = btn
      const onMouseMove = (e) => {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        gsap.to(el, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' })
      }
      const onMouseLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' })
      }
      el.addEventListener('mousemove', onMouseMove)
      el.addEventListener('mouseleave', onMouseLeave)
      addCleanup(() => {
        el.removeEventListener('mousemove', onMouseMove)
        el.removeEventListener('mouseleave', onMouseLeave)
      })
    })

    // --- CARD HOVER GLOW ---
    document.querySelectorAll('.glass').forEach(card => {
      const el = card
      const onMouseMove = (e) => {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
        el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
      }
      el.addEventListener('mousemove', onMouseMove)
      addCleanup(() => el.removeEventListener('mousemove', onMouseMove))
    })

    // Debounced refresh
    let refreshTimer = null
    const debouncedRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 150)
    }
    debouncedRefresh()
    addCleanup(() => { if (refreshTimer) clearTimeout(refreshTimer) })
  } catch (err) {
    console.warn('[GSAPAnimations] init() failed:', err)
  }
}

onMounted(async () => {
  await nextTick()
  await new Promise(r => requestAnimationFrame(r))
  init()

  removeAfterEach = router.afterEach(() => nextTick(init))
})

onUnmounted(() => {
  removeAfterEach?.()
  cleanup()
})
</script>
