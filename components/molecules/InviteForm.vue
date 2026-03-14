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
    await $fetch(`/api/events/${props.eventId}/invite`, {
      method: 'POST',
      body: { email: email.value.trim() },
    })
    success.value = true
    email.value = ''
    emit('invited')
    setTimeout(() => { success.value = false }, 3000)
  } catch (e) {
    error.value = e.data?.statusMessage || t('dashboard.errorInviting')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="invite-form" @submit.prevent="onSubmit">
    <div class="invite-form__row">
      <UInput
        v-model="email"
        type="email"
        :placeholder="t('dashboard.emailPlaceholder')"
        :disabled="loading"
        size="sm"
        icon="i-lucide-mail"
        class="invite-form__input"
      />
      <AppButton variant="primary" size="sm" :disabled="loading || !email.trim()">
        {{ t('dashboard.send') }}
      </AppButton>
    </div>
    <AppText v-if="success" size="sm" class="invite-form__success">
      {{ t('dashboard.inviteSent') }}
    </AppText>
    <AppText v-if="error" size="sm" class="invite-form__error">
      {{ error }}
    </AppText>
  </form>
</template>

<style scoped>
.invite-form__row {
  display: flex;
  gap: var(--space-2);
}

.invite-form__input {
  flex: 1;
}

.invite-form__success {
  color: var(--color-success);
  margin-top: var(--space-2);
}

.invite-form__error {
  color: var(--color-accent-dark);
  margin-top: var(--space-2);
}
</style>
