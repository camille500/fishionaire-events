<script setup>
const { t } = useI18n()

const props = defineProps({
  eventData: { type: Object, required: true },
  accentColor: { type: String, default: 'var(--color-accent)' },
  formattedDate: { type: String, default: null },
  formattedTime: { type: String, default: null },
  hasPoll: { type: Boolean, default: false },
})

const eventTypeEmojiMap = {
  wedding: [
    { emoji: '💍', x: 8, y: 18, delay: 0, duration: 7 },
    { emoji: '💐', x: 85, y: 12, delay: 1.5, duration: 6 },
    { emoji: '🥂', x: 90, y: 58, delay: 2, duration: 8 },
    { emoji: '🤍', x: 12, y: 68, delay: 3, duration: 6.5 },
  ],
  birthday: [
    { emoji: '🎂', x: 10, y: 15, delay: 0, duration: 6 },
    { emoji: '🎈', x: 88, y: 10, delay: 1.5, duration: 7 },
    { emoji: '🎁', x: 85, y: 62, delay: 2.5, duration: 6 },
    { emoji: '🎉', x: 12, y: 65, delay: 1, duration: 7.5 },
  ],
  dinner: [
    { emoji: '🍷', x: 10, y: 14, delay: 0, duration: 6.5 },
    { emoji: '🕯️', x: 87, y: 12, delay: 1.2, duration: 7 },
    { emoji: '🍽️', x: 88, y: 60, delay: 2, duration: 6 },
    { emoji: '✨', x: 14, y: 66, delay: 2.8, duration: 7.5 },
  ],
  baby_shower: [
    { emoji: '👶', x: 10, y: 16, delay: 0, duration: 6 },
    { emoji: '🍼', x: 86, y: 11, delay: 1.5, duration: 7 },
    { emoji: '🧸', x: 88, y: 58, delay: 2, duration: 6.5 },
    { emoji: '🎀', x: 12, y: 64, delay: 2.5, duration: 7 },
  ],
  corporate: [
    { emoji: '🏢', x: 10, y: 15, delay: 0, duration: 7 },
    { emoji: '📊', x: 87, y: 12, delay: 1.5, duration: 6.5 },
    { emoji: '🤝', x: 86, y: 60, delay: 2, duration: 6 },
    { emoji: '🎯', x: 14, y: 65, delay: 2.8, duration: 7.5 },
  ],
  other: [
    { emoji: '🎉', x: 10, y: 15, delay: 0, duration: 6.5 },
    { emoji: '✨', x: 87, y: 11, delay: 1.5, duration: 7 },
    { emoji: '🥂', x: 86, y: 60, delay: 2, duration: 6 },
    { emoji: '🌟', x: 14, y: 66, delay: 2.5, duration: 7 },
  ],
}

const eventEmojis = computed(() =>
  eventTypeEmojiMap[props.eventData?.eventType] || eventTypeEmojiMap.other
)
</script>

<template>
  <header class="invite-hero">
    <!-- Background image or gradient -->
    <div
      v-if="eventData.coverImageUrl"
      class="invite-hero__bg"
      :style="{ backgroundImage: `url(${eventData.coverImageUrl})` }"
    />
    <div v-else class="invite-hero__bg invite-hero__bg--gradient" />

    <!-- Aurora blobs -->
    <div class="invite-hero__aurora" aria-hidden="true">
      <div class="invite-hero__aurora-blob invite-hero__aurora-blob--1" />
      <div class="invite-hero__aurora-blob invite-hero__aurora-blob--2" />
    </div>

    <!-- Cinematic overlay -->
    <div class="invite-hero__overlay" />

    <!-- Floating emojis -->
    <div class="invite-hero__particles" aria-hidden="true">
      <span
        v-for="(item, i) in eventEmojis"
        :key="i"
        class="invite-hero__particle"
        :style="{
          left: item.x + '%',
          top: item.y + '%',
          animationDelay: item.delay + 's',
          animationDuration: item.duration + 's',
        }"
      >{{ item.emoji }}</span>
    </div>

    <!-- Content -->
    <div class="invite-hero__content">
      <div class="invite-hero__logo">
        <NuxtLink to="/" class="invite-hero__logo-link">Fishionaire</NuxtLink>
      </div>

      <div class="invite-hero__center">
        <div v-if="eventData.eventType" class="invite-hero__badge">
          {{ t(`dashboard.eventEditor.eventTypes.${eventData.eventType}`) }}
        </div>

        <h1 class="invite-hero__title">{{ eventData.title }}</h1>

        <div class="invite-hero__meta">
          <span v-if="formattedDate" class="invite-hero__meta-item">
            <Icon name="lucide:calendar" size="18" />
            {{ formattedDate }}
            <span v-if="formattedTime" class="invite-hero__meta-time">
              <Icon name="lucide:clock" size="14" />
              {{ formattedTime }}
            </span>
          </span>
          <span v-else-if="hasPoll" class="invite-hero__meta-item invite-hero__meta-item--poll">
            <Icon name="lucide:bar-chart-3" size="18" />
            {{ t('invite.dateToBeDecided') }}
          </span>
          <span v-if="eventData.location" class="invite-hero__meta-item">
            <Icon name="lucide:map-pin" size="18" />
            {{ eventData.location }}
          </span>
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="invite-hero__scroll-hint">
        <Icon name="lucide:chevrons-down" size="22" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.invite-hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.invite-hero__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.invite-hero__bg--gradient {
  background: linear-gradient(
    135deg,
    var(--event-accent, var(--color-accent)),
    color-mix(in srgb, var(--event-accent, var(--color-accent)) 50%, #1a1a2e)
  );
}

/* Aurora blobs */
.invite-hero__aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.invite-hero__aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.25;
  will-change: transform;
}

.invite-hero__aurora-blob--1 {
  width: 500px;
  height: 500px;
  top: -10%;
  left: 15%;
  background: radial-gradient(circle, var(--event-accent, var(--color-accent)) 0%, transparent 70%);
  animation: aurora-drift 20s ease-in-out infinite;
}

.invite-hero__aurora-blob--2 {
  width: 400px;
  height: 400px;
  bottom: 5%;
  right: 10%;
  background: radial-gradient(circle, color-mix(in srgb, var(--event-accent, var(--color-accent)) 50%, #6c5ce7) 0%, transparent 70%);
  animation: aurora-drift 20s ease-in-out infinite -8s;
}

@keyframes aurora-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}

/* Overlay */
.invite-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.25) 40%,
    rgba(0, 0, 0, 0.15) 60%,
    rgba(0, 0, 0, 0.35) 100%
  );
}

/* Floating emojis */
.invite-hero__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.invite-hero__particle {
  position: absolute;
  font-size: 2rem;
  animation: emoji-float ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  will-change: transform;
  opacity: 0.75;
}

@keyframes emoji-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-18px) rotate(6deg) scale(1.05); }
  75% { transform: translateY(12px) rotate(-4deg) scale(0.97); }
}

/* Content */
.invite-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  min-height: 100svh;
  padding: var(--space-6);
}

.invite-hero__logo {
  padding-top: var(--space-6);
  opacity: 0.7;
  animation: fadeInDown 600ms ease-out both;
}

.invite-hero__logo-link {
  color: #fff;
  text-decoration: none;
  font-family: var(--font-family-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.04em;
}

.invite-hero__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  max-width: 680px;
}

.invite-hero__badge {
  display: inline-flex;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  animation: scaleIn 500ms ease-out 400ms both;
}

.invite-hero__title {
  font-family: var(--font-family-heading);
  font-size: clamp(var(--text-3xl), 7vw, var(--text-5xl));
  font-weight: var(--font-weight-extrabold);
  color: #fff;
  line-height: var(--line-height-tight);
  margin: 0;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  letter-spacing: var(--letter-spacing-tight);
  animation: fadeInUp 800ms ease-out 200ms both;
}

.invite-hero__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  animation: fadeInUp 600ms ease-out 600ms both;
}

.invite-hero__meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
}

.invite-hero__meta-time {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  opacity: 0.7;
  margin-left: var(--space-1);
}

.invite-hero__meta-item--poll {
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

/* Scroll hint */
.invite-hero__scroll-hint {
  padding-bottom: var(--space-8);
  color: rgba(255, 255, 255, 0.5);
  animation: fadeIn 800ms ease-out 1200ms both, float 3s ease-in-out 2s infinite;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Responsive */
@media (max-width: 640px) {
  .invite-hero {
    min-height: 85svh;
  }

  .invite-hero__content {
    min-height: 85svh;
  }

  .invite-hero__particles {
    display: none;
  }

  .invite-hero__particle {
    font-size: 1.4rem;
  }

  .invite-hero__aurora-blob--1 {
    width: 300px;
    height: 300px;
  }

  .invite-hero__aurora-blob--2 {
    width: 250px;
    height: 250px;
  }
}
</style>
