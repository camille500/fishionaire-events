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
</script>

<template>
  <section class="hero-section" :class="{ 'hero-section--small': small }">
    <div class="hero-section__decoration">
      <div class="hero-section__circle hero-section__circle--1" />
      <div class="hero-section__circle hero-section__circle--2" />
      <div class="hero-section__circle hero-section__circle--3" />
    </div>
    <div class="hero-section__container">
      <AppHeading :level="1" align="center" class="hero-section__title">
        {{ title }}
      </AppHeading>
      <AppText v-if="subtitle" size="lg" align="center" class="hero-section__subtitle">
        {{ subtitle }}
      </AppText>
      <div v-if="$slots.default" class="hero-section__actions">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  padding: var(--space-24) var(--space-6);
  overflow: hidden;
}

.hero-section--small {
  padding: var(--space-16) var(--space-6);
}

.hero-section__decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-section__circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
}

.hero-section__circle--1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.hero-section__circle--2 {
  width: 250px;
  height: 250px;
  bottom: -50px;
  left: -50px;
  animation: float 6s ease-in-out infinite 1s;
}

.hero-section__circle--3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 60%;
  animation: float 7s ease-in-out infinite 2s;
}

.hero-section--small .hero-section__circle {
  display: none;
}

.hero-section__container {
  position: relative;
  max-width: var(--max-width-content);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.hero-section__title {
  color: var(--color-text-inverse);
  font-size: var(--text-5xl);
  max-width: 800px;
}

.hero-section--small .hero-section__title {
  font-size: var(--text-4xl);
}

.hero-section__subtitle {
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
}

.hero-section__actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--space-16) var(--space-6);
  }

  .hero-section__title {
    font-size: var(--text-3xl);
  }

  .hero-section--small .hero-section__title {
    font-size: var(--text-2xl);
  }
}
</style>
