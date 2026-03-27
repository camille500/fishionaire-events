<script setup>
const { t } = useI18n()
const router = useRouter()

const props = defineProps({
  event: { type: Object, default: null },
})

const checkmarkRef = ref(null)
const titleRef = ref(null)
const actionsRef = ref(null)
const showContent = ref(false)

onMounted(async () => {
  showContent.value = true

  // Fire confetti (dynamic import)
  const { default: confetti } = await import('canvas-confetti')
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#00b894', '#1a73e8', '#f5a623', '#ff6b6b', '#6c5ce7'],
  })

  // Second burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#00b894', '#1a73e8', '#f5a623'],
    })
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#00b894', '#6c5ce7', '#ff6b6b'],
    })
  }, 200)

  // GSAP animation timeline (dynamic import)
  const { gsap } = await import('gsap')
  nextTick(() => {
    const tl = gsap.timeline()

    if (checkmarkRef.value) {
      tl.fromTo(checkmarkRef.value, {
        scale: 0,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }, 0.1)
    }

    if (titleRef.value) {
      tl.fromTo(titleRef.value, {
        y: 20,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      }, 0.3)
    }

    if (actionsRef.value) {
      const cards = actionsRef.value.querySelectorAll('.celebration__action')
      tl.fromTo(cards, {
        y: 30,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.1,
      }, 0.5)
    }
  })
})

function goToEvent() {
  if (props.event?.id) {
    navigateTo(`/dashboard/events/${props.event.id}?new=1`)
  }
}

function inviteGuests() {
  if (props.event?.id) {
    navigateTo(`/dashboard/events/${props.event.id}?tab=guests&new=1`)
  }
}

async function shareLink() {
  if (props.event?.id) {
    const link = `${window.location.origin}/events/${props.event.id}`
    try {
      await navigator.clipboard.writeText(link)
      useToast().add({
        title: t('wizard.celebration.linkCopied'),
        icon: 'i-lucide-check',
        color: 'success',
        duration: 3000,
      })
    } catch {
      // Fallback
    }
  }
}
</script>

<template>
  <div class="celebration">
    <!-- Checkmark -->
    <div ref="checkmarkRef" class="celebration__checkmark">
      <Icon name="lucide:check" size="36" />
    </div>

    <!-- Title -->
    <div ref="titleRef" class="celebration__text">
      <AppHeading :level="2" size="xl">{{ t('wizard.celebration.title') }}</AppHeading>
      <AppText size="base" class="celebration__event-name">{{ event?.title || '' }}</AppText>
      <AppText size="sm" muted>{{ t('wizard.celebration.subtitle') }}</AppText>
    </div>

    <!-- Action cards -->
    <div ref="actionsRef" class="celebration__actions">
      <button type="button" class="celebration__action" @click="goToEvent">
        <Icon name="lucide:calendar" size="20" />
        <span class="celebration__action-label">{{ t('wizard.celebration.goToEvent') }}</span>
      </button>

      <button type="button" class="celebration__action" @click="inviteGuests">
        <Icon name="lucide:users" size="20" />
        <span class="celebration__action-label">{{ t('wizard.celebration.inviteGuests') }}</span>
      </button>

      <button type="button" class="celebration__action" @click="shareLink">
        <Icon name="lucide:share-2" size="20" />
        <span class="celebration__action-label">{{ t('wizard.celebration.shareLink') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.celebration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8) 0;
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.celebration__checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-success);
  color: white;
  box-shadow: 0 0 0 8px color-mix(in srgb, var(--color-success) 15%, transparent);
}

.celebration__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.celebration__event-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

.celebration__actions {
  display: flex;
  gap: var(--space-3);
  width: 100%;
}

.celebration__action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  font-family: var(--font-family);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}

.celebration__action:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.celebration__action:active {
  transform: scale(0.97);
}

.celebration__action-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 480px) {
  .celebration__actions {
    flex-direction: column;
  }
}
</style>
