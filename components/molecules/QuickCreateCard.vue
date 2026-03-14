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

const placeholder = computed(() => {
  return locale.value === 'nl'
    ? 'Wat ben je aan het plannen?'
    : 'What are you planning?'
})
</script>

<template>
  <div class="quick-create">
    <div class="quick-create__header">
      <Icon name="lucide:sparkles" size="18" class="quick-create__icon" />
      <span class="quick-create__title">
        {{ locale === 'nl' ? 'Snel aanmaken' : 'Quick create' }}
      </span>
    </div>

    <div class="quick-create__input-wrap">
      <input
        v-model="prompt"
        type="text"
        class="quick-create__input"
        :placeholder="placeholder"
        @keydown="onKeydown"
      />
      <button
        type="button"
        class="quick-create__submit"
        :disabled="!prompt.trim()"
        @click="onSubmit"
      >
        <Icon name="lucide:arrow-right" size="16" />
      </button>
    </div>

    <span class="quick-create__hint">
      {{ locale === 'nl' ? 'bijv. "Verjaardagsfeest voor 20 personen volgende zaterdag"' : 'e.g. "Birthday party for 20 people next Saturday"' }}
    </span>
  </div>
</template>

<style scoped>
.quick-create {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border: 2px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border-light));
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
  height: 100%;
  transition: border-color var(--transition-base);
}

.quick-create:focus-within {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border-light));
}

.quick-create__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.quick-create__icon {
  color: var(--color-accent);
}

.quick-create__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.quick-create__input-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-background);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.quick-create__input-wrap:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.quick-create__input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
}

.quick-create__input::placeholder {
  color: var(--color-text-muted);
}

.quick-create__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}

.quick-create__submit:hover:not(:disabled) {
  opacity: 0.9;
}

.quick-create__submit:disabled {
  opacity: 0.4;
  cursor: default;
}

.quick-create__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  opacity: 0.7;
}
</style>
