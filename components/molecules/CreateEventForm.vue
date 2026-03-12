<script setup>
const { t } = useI18n()
const { tier: subscriptionTier, upgradeEvent } = useSubscription()

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
      body: { title: title.value.trim(), tier: selectedTier.value },
    })

    if (result.requiresPayment && result.id) {
      const upgraded = await upgradeEvent(result.id, selectedTier.value)
      title.value = ''
      selectedTier.value = 'free'
      emit('created', upgraded?.event || result)
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
  <form class="create-event-form" @submit.prevent="onSubmit">
    <div class="create-event-form__field">
      <input
        v-model="title"
        type="text"
        class="create-event-form__input"
        :placeholder="t('dashboard.eventTitlePlaceholder')"
        autofocus
        :disabled="loading"
      />
    </div>

    <TierSelector
      v-model="selectedTier"
      :subscription-tier="subscriptionTier"
      class="create-event-form__tier"
    />

    <AppText v-if="error" size="sm" class="create-event-form__error">{{ error }}</AppText>
    <div class="create-event-form__actions">
      <AppButton variant="primary" size="sm" :disabled="loading || !title.trim()">
        <Icon name="lucide:plus" size="16" />
        {{ loading ? t('dashboard.creating') : t('dashboard.createEvent') }}
      </AppButton>
      <AppButton variant="ghost" size="sm" type="button" @click="emit('cancel')">
        {{ t('dashboard.cancel') }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.create-event-form {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 2px dashed var(--color-accent);
}

.create-event-form__field {
  margin-bottom: var(--space-4);
}

.create-event-form__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  background: var(--color-background);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
  outline: none;
}

.create-event-form__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15);
}

.create-event-form__input::placeholder {
  color: var(--color-text-muted);
}

.create-event-form__input:disabled {
  opacity: 0.6;
}

.create-event-form__tier {
  margin-bottom: var(--space-4);
}

.create-event-form__error {
  color: var(--color-accent-dark);
  margin-bottom: var(--space-3);
}

.create-event-form__actions {
  display: flex;
  gap: var(--space-3);
}
</style>
