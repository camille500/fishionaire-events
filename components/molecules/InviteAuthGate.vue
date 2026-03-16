<script setup>
const { t } = useI18n()
const router = useRouter()

const code = ref('')
const loading = ref(false)
const error = ref('')

async function submitCode() {
  if (!code.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    await $fetch(`/api/invite/${code.value.trim()}`)
    // Valid code — redirect to personal invite page
    router.push(`/invite/${code.value.trim()}`)
  } catch (e) {
    if (e.statusCode === 429) {
      error.value = t('invite.auth.tooManyAttempts')
    } else {
      error.value = t('invite.auth.invalidCode')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="invite-auth-gate">
    <div class="invite-auth-gate__icon">
      <Icon name="lucide:ticket" size="24" />
    </div>
    <h3 class="invite-auth-gate__title">{{ t('invite.auth.title') }}</h3>
    <AppText size="sm" muted class="invite-auth-gate__desc">{{ t('invite.auth.description') }}</AppText>

    <form class="invite-auth-gate__form" @submit.prevent="submitCode">
      <AppInput
        v-model="code"
        type="text"
        :placeholder="t('invite.auth.codePlaceholder')"
        :disabled="loading"
        size="sm"
        icon="lucide:key-round"
        class="invite-auth-gate__input"
      />
      <AppButton variant="primary" size="sm" :loading="loading" :disabled="!code.trim()">
        {{ t('invite.auth.submit') }}
      </AppButton>
    </form>

    <AppText v-if="error" size="sm" class="invite-auth-gate__error">{{ error }}</AppText>

    <div class="invite-auth-gate__divider">
      <span>{{ t('invite.auth.or') }}</span>
    </div>

    <NuxtLink to="/sign-in" class="invite-auth-gate__sign-in">
      <Icon name="lucide:log-in" size="14" />
      {{ t('invite.auth.signIn') }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.invite-auth-gate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-6);
  text-align: center;
}

.invite-auth-gate__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-auth-gate__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.invite-auth-gate__desc {
  max-width: 320px;
}

.invite-auth-gate__form {
  display: flex;
  gap: var(--space-2);
  width: 100%;
  max-width: 360px;
}

.invite-auth-gate__input {
  flex: 1;
}

.invite-auth-gate__error {
  color: var(--color-error);
}

.invite-auth-gate__divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 360px;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.invite-auth-gate__divider::before,
.invite-auth-gate__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

.invite-auth-gate__sign-in {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.invite-auth-gate__sign-in:hover {
  text-decoration: underline;
}
</style>
