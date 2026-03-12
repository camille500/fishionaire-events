<script setup>
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

const floatingEmojis = [
  { emoji: '🎂', x: '10%', y: '20%', delay: 0, duration: 8 },
  { emoji: '🎉', x: '85%', y: '15%', delay: 2, duration: 10 },
  { emoji: '💍', x: '75%', y: '70%', delay: 4, duration: 9 },
  { emoji: '🎈', x: '15%', y: '75%', delay: 1, duration: 7 },
  { emoji: '🎁', x: '50%', y: '10%', delay: 3, duration: 11 },
  { emoji: '🥂', x: '90%', y: '50%', delay: 5, duration: 8 },
  { emoji: '🎊', x: '5%', y: '45%', delay: 2.5, duration: 9 },
  { emoji: '✨', x: '60%', y: '80%', delay: 1.5, duration: 10 },
]
</script>

<template>
  <section class="hero" :class="{ 'hero--small': small }">
    <!-- Animated gradient mesh background -->
    <div class="hero__mesh" />

    <!-- Floating emoji decorations -->
    <div v-if="!small" class="hero__floaters" aria-hidden="true">
      <span
        v-for="(item, i) in floatingEmojis"
        :key="i"
        class="hero__floater"
        :style="{
          left: item.x,
          top: item.y,
          animationDelay: item.delay + 's',
          animationDuration: item.duration + 's',
        }"
      >{{ item.emoji }}</span>
    </div>

    <!-- Dot particles -->
    <div class="hero__dots" aria-hidden="true">
      <span v-for="n in 20" :key="n" class="hero__dot" :style="{
        left: (n * 4.7 + 3) % 97 + '%',
        top: (n * 7.3 + 5) % 93 + '%',
        animationDelay: (n * 0.3) + 's',
        animationDuration: (3 + (n % 4)) + 's',
      }" />
    </div>

    <div class="hero__container">
      <AppHeading
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 600 } }"
        :level="1"
        align="center"
        class="hero__title"
      >
        {{ title }}
      </AppHeading>
      <p
        v-if="subtitle"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 600 } }"
        class="hero__subtitle"
      >
        {{ subtitle }}
      </p>
      <div
        v-if="$slots.default"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 600 } }"
        class="hero__actions"
      >
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: var(--space-24) var(--space-6) calc(var(--space-24) + 2rem);
  overflow: hidden;
  isolation: isolate;
}

.hero--small {
  padding: var(--space-16) var(--space-6);
}

/* Animated gradient mesh */
.hero__mesh {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255, 107, 107, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(154, 86, 255, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(255, 154, 86, 0.1) 0%, transparent 50%),
    var(--gradient-hero);
  background-size: 200% 200%;
  animation: gradient-shift 12s ease infinite;
}

/* Floating emojis */
.hero__floaters {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.hero__floater {
  position: absolute;
  font-size: 2rem;
  opacity: 0.15;
  animation: float-gentle linear infinite;
  filter: blur(0.5px);
}

.hero--small .hero__floaters {
  display: none;
}

/* Dot particles */
.hero__dots {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.hero__dot {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  animation: float ease-in-out infinite;
}

/* Content */
.hero__container {
  position: relative;
  max-width: var(--max-width-content);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.hero__title {
  color: var(--color-text-inverse);
  font-size: var(--text-5xl);
  font-weight: var(--font-weight-extrabold);
  max-width: 800px;
  letter-spacing: -0.03em;
}

.hero--small .hero__title {
  font-size: var(--text-4xl);
}

.hero__subtitle {
  color: rgba(255, 255, 255, 0.75);
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

@media (max-width: 768px) {
  .hero {
    padding: var(--space-16) var(--space-6) var(--space-20);
  }

  .hero__title {
    font-size: var(--text-3xl);
  }

  .hero--small .hero__title {
    font-size: var(--text-2xl);
  }

  .hero__floater {
    font-size: 1.5rem;
    opacity: 0.1;
  }
}
</style>
