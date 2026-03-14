<script setup>
const { t } = useI18n()
const { tier: subscriptionTier, upgradeEvent } = useSubscription()

const props = defineProps({
  templateId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['created', 'cancel'])

const title = ref('')
const selectedTier = ref('free')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  if (!title.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const result = await $fetch('/api/events', {
      method: 'POST',
      body: { title: title.value.trim(), tier: selectedTier.value, templateId: props.templateId },
    })

    if (result.requiresPayment && result.id) {
      await upgradeEvent(result.id, selectedTier.value)
      // User is redirected to Stripe Checkout — no further code runs
      return
    } else {
      title.value = ''
      selectedTier.value = 'free'
      emit('created', result)
    }
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.errorCreating')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="create-form" @submit.prevent="onSubmit">
    <div class="create-form__field">
      <label class="create-form__label" for="new-event-title">
        {{ t('dashboard.eventTitlePlaceholder') }}
      </label>
      <input
        id="new-event-title"
        v-model="title"
        type="text"
        class="create-form__input"
        :placeholder="t('dashboard.eventTitlePlaceholder')"
        :disabled="loading"
        autofocus
      />
    </div>

    <TierSelector
      v-model="selectedTier"
      :subscription-tier="subscriptionTier"
      class="create-form__tier"
    />

    <p v-if="error" class="create-form__error">{{ error }}</p>

    <div class="create-form__actions">
      <button
        type="submit"
        class="create-form__submit"
        :disabled="loading || !title.trim()"
      >
        <Icon name="lucide:plus" size="16" />
        {{ loading ? t('dashboard.creating') : t('dashboard.createEvent') }}
      </button>
      <button
        type="button"
        class="create-form__cancel"
        @click="emit('cancel')"
      >
        {{ t('dashboard.cancel') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.create-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.create-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.create-form__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.create-form__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
  outline: none;
}

.create-form__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.15);
}

.create-form__input::placeholder {
  color: var(--color-text-muted);
}

.create-form__tier {
  margin-top: var(--space-2);
}

.create-form__error {
  font-size: var(--text-sm);
  color: var(--color-error, #e74c3c);
  margin: 0;
}

.create-form__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.create-form__submit {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.create-form__submit:hover:not(:disabled) {
  background: var(--color-accent-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-accent);
}

.create-form__submit:active:not(:disabled) {
  transform: translateY(0);
}

.create-form__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-form__cancel {
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-5);
  background: none;
  color: var(--color-text-muted);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.create-form__cancel:hover {
  color: var(--color-text-primary);
}
</style>
