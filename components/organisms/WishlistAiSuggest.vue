<script setup>
const props = defineProps({
  eventId: { type: [String, Number], required: true },
  eventType: { type: String, default: '' },
  eventTitle: { type: String, default: '' },
})

const emit = defineEmits(['add'])
const { t, locale } = useI18n()

const prompt = ref('')
const suggestions = ref([])
const loading = ref(false)
const error = ref('')

async function generate() {
  if (!prompt.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    const result = await $fetch(`/api/events/${props.eventId}/wishlist/ai-suggest`, {
      method: 'POST',
      body: {
        prompt: prompt.value.trim(),
        eventType: props.eventType,
        eventTitle: props.eventTitle,
        language: locale.value,
      },
    })
    suggestions.value = result.suggestions || []
  } catch (e) {
    error.value = e.data?.statusMessage || t('wishlist.ai.error')
  } finally {
    loading.value = false
  }
}

function addSuggestion(suggestion) {
  emit('add', {
    title: suggestion.title,
    description: suggestion.description,
    priceCents: suggestion.priceCents,
    category: suggestion.category,
    provider: 'ai',
  })
  suggestions.value = suggestions.value.filter((s) => s.title !== suggestion.title)
}

function dismiss(suggestion) {
  suggestions.value = suggestions.value.filter((s) => s.title !== suggestion.title)
}

function formatPrice(cents) {
  if (!cents) return ''
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
</script>

<template>
  <div class="ai-suggest">
    <div class="ai-suggest__input-area">
      <div class="ai-suggest__header">
        <Icon name="lucide:sparkles" class="ai-suggest__icon" />
        <span class="ai-suggest__title">{{ t('wishlist.ai.title') }}</span>
      </div>
      <div class="ai-suggest__form">
        <AppTextarea
          v-model="prompt"
          :placeholder="t('wishlist.ai.placeholder')"
          :rows="2"
        />
        <AppButton variant="gradient" :loading="loading" @click="generate">
          <Icon name="lucide:wand-2" />
          {{ t('wishlist.ai.generate') }}
        </AppButton>
      </div>
      <p v-if="error" class="ai-suggest__error">{{ error }}</p>
    </div>

    <TransitionGroup v-if="suggestions.length > 0" name="suggest-card" tag="div" class="ai-suggest__results">
      <div v-for="suggestion in suggestions" :key="suggestion.title" class="ai-suggest__card">
        <div class="ai-suggest__card-content">
          <h4 class="ai-suggest__card-title">{{ suggestion.title }}</h4>
          <p class="ai-suggest__card-desc">{{ suggestion.description }}</p>
          <div class="ai-suggest__card-meta">
            <span v-if="suggestion.priceCents" class="ai-suggest__card-price">{{ formatPrice(suggestion.priceCents) }}</span>
            <span v-if="suggestion.category" class="ai-suggest__card-cat">{{ t(`wishlist.categories.${suggestion.category}`, suggestion.category) }}</span>
          </div>
        </div>
        <div class="ai-suggest__card-actions">
          <AppButton variant="primary" size="sm" @click="addSuggestion(suggestion)">
            <Icon name="lucide:plus" />
            {{ t('wishlist.ai.addToList') }}
          </AppButton>
          <button class="ai-suggest__dismiss" @click="dismiss(suggestion)">
            <Icon name="lucide:x" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ai-suggest {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ai-suggest__input-area {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 6%, var(--color-surface)), color-mix(in srgb, var(--color-accent-violet) 4%, var(--color-surface)));
  border: 1px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.ai-suggest__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ai-suggest__icon {
  color: var(--color-accent);
}

.ai-suggest__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.ai-suggest__form {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
}

.ai-suggest__form > :first-child {
  flex: 1;
}

.ai-suggest__error {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin: 0;
}

.ai-suggest__results {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ai-suggest__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.ai-suggest__card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.ai-suggest__card-content {
  flex: 1;
  min-width: 0;
}

.ai-suggest__card-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.ai-suggest__card-desc {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0;
}

.ai-suggest__card-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.ai-suggest__card-price {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.ai-suggest__card-cat {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
}

.ai-suggest__card-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.ai-suggest__dismiss {
  background: none;
  border: none;
  padding: var(--space-1);
  cursor: pointer;
  color: var(--color-text-tertiary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.ai-suggest__dismiss:hover {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}

.suggest-card-enter-active {
  transition: all var(--transition-base);
}

.suggest-card-leave-active {
  transition: all var(--transition-fast);
}

.suggest-card-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.suggest-card-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
