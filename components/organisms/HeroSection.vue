<script setup>
const { t } = useI18n()

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  small: {
    type: Boolean,
    default: false,
  },
})

const typewriterRef = ref(null)

const phrases = computed(() => [
  t('home.hero.typewriter.1'),
  t('home.hero.typewriter.2'),
  t('home.hero.typewriter.3'),
  t('home.hero.typewriter.4'),
])

const eventEmojis = [
  { emoji: '🎂', x: 12, y: 10, delay: 0, duration: 6 },
  { emoji: '🎈', x: 80, y: 6, delay: 1.5, duration: 7 },
  { emoji: '🥂', x: 88, y: 52, delay: 3, duration: 5.5 },
  { emoji: '🎁', x: 8, y: 62, delay: 0.8, duration: 6.5 },
  { emoji: '🎉', x: 50, y: 3, delay: 2.2, duration: 7.5 },
  { emoji: '💐', x: 92, y: 28, delay: 4, duration: 6 },
  { emoji: '🍰', x: 22, y: 78, delay: 1, duration: 5 },
  { emoji: '✨', x: 72, y: 72, delay: 2.8, duration: 6.8 },
]

onMounted(() => {
  const el = typewriterRef.value
  if (!el) return

  let phraseIdx = 0, charIdx = 0, deleting = false

  function type() {
    const current = phrases.value[phraseIdx]
    if (!current) return
    if (!deleting) {
      el.textContent = current.substring(0, charIdx++)
      if (charIdx > current.length) {
        deleting = true
        setTimeout(type, 2200)
        return
      }
      setTimeout(type, 50 + Math.random() * 30)
    } else {
      el.textContent = current.substring(0, charIdx--)
      if (charIdx < 0) {
        deleting = false
        phraseIdx = (phraseIdx + 1) % phrases.value.length
        charIdx = 0
        setTimeout(type, 400)
        return
      }
      setTimeout(type, 25)
    }
  }
  setTimeout(type, 1200)
})
</script>

<template>
  <!-- Small variant (pricing, help pages) -->
  <section v-if="small" class="hero hero--small">
    <div class="hero__aurora" aria-hidden="true">
      <div class="hero__aurora-layer hero__aurora-layer--cyan" />
      <div class="hero__aurora-layer hero__aurora-layer--violet" />
    </div>
    <div class="hero__container">
      <h1 class="hero__title reveal">{{ title }}</h1>
      <p v-if="subtitle" class="hero__subtitle reveal">{{ subtitle }}</p>
      <div v-if="$slots.default" class="hero__actions reveal">
        <slot />
      </div>
    </div>
  </section>

  <!-- Full homepage variant -->
  <section v-else class="hero">
    <div class="hero__aurora" aria-hidden="true">
      <div class="hero__aurora-layer hero__aurora-layer--cyan" />
      <div class="hero__aurora-layer hero__aurora-layer--violet" />
      <div class="hero__aurora-layer hero__aurora-layer--violet-alt" />
    </div>

    <div class="hero-grid">
      <div class="hero-content">
        <div class="hero-badge reveal">
          <span class="badge-dot"></span>
          {{ t('home.hero.badge') }}
        </div>
        <h1 class="hero-title reveal">
          {{ t('home.hero.titleLine1') }}<br />
          <span class="gradient-text">{{ t('home.hero.titleLine2') }}</span>
        </h1>
        <p class="hero-desc reveal">{{ subtitle }}</p>
        <div class="hero-typewriter reveal" v-if="phrases[0]">
          <span class="typewriter-prefix">&gt; </span>
          <span class="typewriter-text" ref="typewriterRef"></span>
          <span class="typewriter-cursor">|</span>
        </div>
        <div class="hero-cta reveal">
          <slot />
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating event emojis -->
        <div class="emoji-field" aria-hidden="true">
          <span
            v-for="(item, i) in eventEmojis"
            :key="i"
            class="floating-emoji"
            :style="{
              left: item.x + '%',
              top: item.y + '%',
              animationDelay: item.delay + 's',
              animationDuration: item.duration + 's',
            }"
          >{{ item.emoji }}</span>
        </div>

        <!-- Central card -->
        <div class="hero-card reveal">
          <div class="hero-card__header">
            <div class="hero-card__dot hero-card__dot--red"></div>
            <div class="hero-card__dot hero-card__dot--yellow"></div>
            <div class="hero-card__dot hero-card__dot--green"></div>
          </div>
          <div class="hero-card__body">
            <svg class="hero-card__icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
            <span class="hero-card__label">{{ t('home.hero.card.guests') }}</span>
            <span class="hero-card__stat">2,847</span>
          </div>
        </div>

        <!-- Floating stat badges -->
        <div class="float-badge float-badge--1 animate-float">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span>98% RSVP</span>
        </div>
        <div class="float-badge float-badge--2 animate-float-slow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>4.9 / 5.0</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(135deg, #f0f4f8 0%, #e8edf5 50%, #f5f0fa 100%);
}

:global(.dark) .hero {
  background: #030306;
}

.hero--small {
  padding: var(--space-16) var(--space-6);
}

.hero__aurora {
  position: absolute;
  inset: 0;
  z-index: -2;
  overflow: hidden;
}

.hero__aurora-layer {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: aurora-shift 20s ease-in-out infinite, aurora-drift 25s ease-in-out infinite;
}

.hero__aurora-layer--cyan {
  width: 600px;
  height: 600px;
  top: -10%;
  left: 15%;
  background: radial-gradient(circle, rgba(0, 184, 148, 0.1) 0%, transparent 70%);
}

:global(.dark) .hero__aurora-layer--cyan {
  background: radial-gradient(circle, rgba(0, 184, 148, 0.25) 0%, transparent 70%);
}

.hero__aurora-layer--violet {
  width: 500px;
  height: 500px;
  top: 20%;
  right: 10%;
  background: radial-gradient(circle, rgba(108, 92, 231, 0.08) 0%, transparent 70%);
  animation-delay: -7s;
}

:global(.dark) .hero__aurora-layer--violet {
  background: radial-gradient(circle, rgba(108, 92, 231, 0.2) 0%, transparent 70%);
}

.hero__aurora-layer--violet-alt {
  width: 450px;
  height: 450px;
  bottom: -5%;
  left: 40%;
  background: radial-gradient(circle, rgba(108, 92, 231, 0.06) 0%, transparent 70%);
  animation-delay: -13s;
}

:global(.dark) .hero__aurora-layer--violet-alt {
  background: radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%);
}

/* Small hero centered */
.hero--small .hero__container {
  position: relative;
  max-width: var(--max-width-content);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.hero__title {
  color: var(--text-primary);
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: var(--font-weight-extrabold);
  max-width: 800px;
  letter-spacing: -0.03em;
  line-height: var(--line-height-tight);
  text-align: center;
}

.hero__subtitle {
  color: var(--text-secondary);
  font-size: var(--text-lg);
  text-align: center;
  max-width: 600px;
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
}

/* Full hero 2-column grid */
.hero-grid {
  min-height: 88vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px 80px;
  position: relative;
  overflow: visible;
}

.hero-content { max-width: 620px; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-accent);
  background: var(--color-accent-bg);
  border: 1px solid rgba(0, 184, 148, 0.15);
  border-radius: 6px;
  margin-bottom: 28px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: pulse-dot 2s ease-in-out infinite;
  flex-shrink: 0;
}

.hero-title {
  font-size: clamp(2.6rem, 5.2vw, 4rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin-bottom: 28px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-family-heading);
}

.hero-desc {
  color: var(--text-secondary);
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 20px;
  max-width: 500px;
}

.hero-typewriter {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--color-accent);
  margin-bottom: 32px;
  padding: 10px 16px;
  background: rgba(0, 184, 148, 0.04);
  border: 1px solid rgba(0, 184, 148, 0.1);
  border-radius: 6px;
  max-width: 500px;
  min-height: 44px;
}

.typewriter-prefix { opacity: 0.5; user-select: none; }
.typewriter-text { white-space: nowrap; overflow: hidden; }
.typewriter-cursor { animation: blink 1s step-end infinite; font-weight: 300; opacity: 0.7; }

.hero-cta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

/* Hero visual */
.hero-visual {
  position: relative;
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Floating event emojis */
.emoji-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.floating-emoji {
  position: absolute;
  font-size: 2rem;
  animation: emoji-float ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
  will-change: transform;
}

@keyframes emoji-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-18px) rotate(6deg) scale(1.05); }
  50% { transform: translateY(-8px) rotate(-4deg) scale(1); }
  75% { transform: translateY(-22px) rotate(3deg) scale(1.02); }
}

/* Central hero card */
.hero-card {
  position: relative;
  z-index: 2;
  width: 220px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

:global(.dark) .hero-card {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.hero-card__header {
  display: flex;
  gap: 6px;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--card-border);
}

.hero-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.hero-card__dot--red { background: #ff5f57; }
.hero-card__dot--yellow { background: #febc2e; }
.hero-card__dot--green { background: #28c840; }

.hero-card__body {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.hero-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hero-card__stat {
  font-family: var(--font-family-heading);
  font-size: 2rem;
  font-weight: 800;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Floating badges */
.float-badge {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

:global(.dark) .float-badge {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.float-badge--1 { top: 15%; right: 0; }
.float-badge--2 { bottom: 18%; left: -10px; }

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; text-align: center; padding-top: 100px; gap: 32px; min-height: auto; }
  .hero-content { max-width: 100%; }
  .hero-desc { margin-left: auto; margin-right: auto; }
  .hero-badge { margin-left: auto; margin-right: auto; }
  .hero-typewriter { margin-left: auto; margin-right: auto; }
  .hero-cta { justify-content: center; }
  .hero-visual { min-height: 340px; }
  .floating-emoji { font-size: 1.5rem; }
}

@media (max-width: 768px) {
  .hero--small { padding: var(--space-16) var(--space-6) var(--space-20); }
  .hero__aurora-layer--cyan { width: 350px; height: 350px; }
  .hero__aurora-layer--violet { width: 300px; height: 300px; }
  .hero__aurora-layer--violet-alt { width: 250px; height: 250px; }
}
</style>
