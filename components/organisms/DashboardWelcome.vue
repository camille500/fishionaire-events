<script setup>
const { t, locale } = useI18n()
const localePath = useLocalePath()

const prompt = ref('')

function onSubmit() {
  if (!prompt.value.trim()) return
  navigateTo({
    path: localePath('dashboard') + '/events/create',
    query: { prompt: prompt.value.trim() },
  })
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    onSubmit()
  }
}

function startWithTemplate(type) {
  navigateTo({
    path: localePath('dashboard') + '/events/create',
    query: { template: type },
  })
}

function startFromScratch() {
  navigateTo(localePath('dashboard') + '/events/create')
}

const templates = computed(() => [
  {
    type: 'birthday',
    icon: 'lucide:cake',
    label: locale.value === 'nl' ? 'Verjaardagsfeest' : 'Birthday Party',
  },
  {
    type: 'dinner',
    icon: 'lucide:utensils',
    label: locale.value === 'nl' ? 'Etentje' : 'Dinner Party',
  },
  {
    type: 'wedding',
    icon: 'lucide:heart',
    label: locale.value === 'nl' ? 'Bruiloft' : 'Wedding',
  },
  {
    type: 'corporate',
    icon: 'lucide:briefcase',
    label: locale.value === 'nl' ? 'Zakelijk' : 'Corporate Event',
  },
])

const placeholder = computed(() => {
  return locale.value === 'nl'
    ? 'Beschrijf je evenement... bijv. "Een verjaardagsfeest voor 30 personen volgende zaterdag"'
    : 'Describe your event... e.g. "A birthday dinner for 30 people next Saturday evening"'
})
</script>

<template>
  <div class="welcome">
    <div class="welcome__hero">
      <div class="welcome__icon-wrap">
        <Icon name="lucide:party-popper" size="40" class="welcome__hero-icon" />
      </div>
      <AppHeading :level="1" size="2xl" align="center">
        {{ locale === 'nl' ? 'Laten we je eerste evenement plannen' : "Let's plan your first event" }}
      </AppHeading>
      <AppText size="sm" muted align="center">
        {{ locale === 'nl' ? 'Beschrijf wat je wilt en AI bouwt het voor je op' : 'Describe what you want and AI will build it for you' }}
      </AppText>
    </div>

    <!-- AI Prompt -->
    <div class="welcome__prompt">
      <div class="welcome__prompt-input-wrap">
        <Icon name="lucide:sparkles" size="16" class="welcome__prompt-icon" />
        <textarea
          v-model="prompt"
          class="welcome__prompt-input"
          :placeholder="placeholder"
          rows="2"
          @keydown="onKeydown"
        />
      </div>
      <AppButton
        variant="gradient"
        :disabled="!prompt.trim()"
        @click="onSubmit"
      >
        <Icon name="lucide:sparkles" size="14" />
        {{ locale === 'nl' ? 'Bouw mijn evenement' : 'Build my event' }}
      </AppButton>
    </div>

    <!-- Template quick picks -->
    <div class="welcome__divider">
      <span>{{ locale === 'nl' ? 'of begin met een template' : 'or start with a template' }}</span>
    </div>

    <div class="welcome__templates">
      <button
        v-for="tmpl in templates"
        :key="tmpl.type"
        type="button"
        class="welcome__template-card"
        @click="startWithTemplate(tmpl.type)"
      >
        <Icon :name="tmpl.icon" size="24" class="welcome__template-icon" />
        <span class="welcome__template-label">{{ tmpl.label }}</span>
      </button>
    </div>

    <button type="button" class="welcome__scratch-link" @click="startFromScratch">
      {{ locale === 'nl' ? 'of begin helemaal opnieuw' : 'or start from scratch' }}
      <Icon name="lucide:arrow-right" size="14" />
    </button>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-8) 0;
}

.welcome__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.welcome__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-2xl);
  background: var(--color-accent-dim);
  margin-bottom: var(--space-2);
}

.welcome__hero-icon {
  color: var(--color-accent);
}

/* Prompt */
.welcome__prompt {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border: 2px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border-light));
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.welcome__prompt-input-wrap {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
}

.welcome__prompt-icon {
  color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.welcome__prompt-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
  resize: none;
  line-height: var(--line-height-normal);
}

.welcome__prompt-input::placeholder {
  color: var(--color-text-muted);
}

/* Divider */
.welcome__divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.welcome__divider::before,
.welcome__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

/* Template cards */
.welcome__templates {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  width: 100%;
}

.welcome__template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  font-family: var(--font-family);
  transition: all var(--transition-fast);
}

.welcome__template-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.welcome__template-icon {
  color: var(--color-accent);
}

.welcome__template-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: center;
}

/* Scratch link */
.welcome__scratch-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.welcome__scratch-link:hover {
  color: var(--color-text-primary);
}

@media (max-width: 640px) {
  .welcome__templates {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
