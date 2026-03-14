<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['invited'])

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function onSubmit() {
  if (!isValidEmail(email.value)) {
    error.value = t('dashboard.invalidEmail')
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await $fetch(`/api/events/${props.eventId}/co-organizers`, {
      method: 'POST',
      body: { email: email.value.trim() },
    })
    success.value = true
    email.value = ''
    emit('invited')
    setTimeout(() => { success.value = false }, 3000)
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.eventEditor.errorCoOrganizer')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="co-org-form" @submit.prevent="onSubmit">
    <div class="co-org-form__row">
      <AppInput
        v-model="email"
        type="email"
        :placeholder="t('dashboard.eventEditor.coOrganizerEmailPlaceholder')"
        :disabled="loading"
        size="sm"
        icon="lucide:user-plus"
        class="co-org-form__input"
      />
      <AppButton variant="primary" size="sm" :disabled="loading || !email.trim()">
        {{ t('dashboard.eventEditor.addCoOrganizer') }}
      </AppButton>
    </div>
    <AppText v-if="success" size="sm" class="co-org-form__success">
      {{ t('dashboard.eventEditor.coOrganizerInvited') }}
    </AppText>
    <AppText v-if="error" size="sm" class="co-org-form__error">
      {{ error }}
    </AppText>
  </form>
</template>

<style scoped>
.co-org-form__row {
  display: flex;
  gap: var(--space-2);
}

.co-org-form__input {
  flex: 1;
}

.co-org-form__success {
  color: var(--color-success);
  margin-top: var(--space-2);
}

.co-org-form__error {
  color: var(--color-accent-dark);
  margin-top: var(--space-2);
}
</style>
