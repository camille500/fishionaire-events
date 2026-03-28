<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const { user: clerkUser } = useUser()
const { profile, saving, updateProfile, uploadAvatar } = useProfile()

const returnUrl = String(route.query.return || '/dashboard')
const prefillName = String(route.query.name || '')

const displayName = ref('')
const avatarUploading = ref(false)

// Pre-fill from query param, then from profile/clerk
watch(profile, (val) => {
  if (displayName.value) return // don't overwrite user input
  displayName.value = val?.displayName || prefillName || clerkUser.value?.firstName || ''
}, { immediate: true })

onMounted(() => {
  if (!displayName.value) {
    displayName.value = prefillName || clerkUser.value?.firstName || ''
  }
})

const avatarSrc = computed(() => {
  return profile.value?.avatarUrl || clerkUser.value?.imageUrl || null
})

async function onAvatarUpload(event) {
  const file = event.target?.files?.[0]
  if (!file) return
  avatarUploading.value = true
  try {
    await uploadAvatar(file)
  } finally {
    avatarUploading.value = false
  }
}

async function finish() {
  if (displayName.value.trim()) {
    await updateProfile({ displayName: displayName.value.trim() })
  }
  await navigateTo(returnUrl, { replace: true })
}

async function skip() {
  await navigateTo(returnUrl, { replace: true })
}
</script>

<template>
  <div class="welcome">
    <div class="welcome__card">
      <div class="welcome__header">
        <span class="welcome__emoji">👋</span>
        <h1 class="welcome__title">{{ t('welcome.title') }}</h1>
        <p class="welcome__desc">{{ t('welcome.description') }}</p>
      </div>

      <!-- Avatar -->
      <div class="welcome__avatar-section">
        <div class="welcome__avatar" @click="$refs.avatarInput?.click()">
          <img v-if="avatarSrc" :src="avatarSrc" class="welcome__avatar-img" />
          <Icon v-else name="lucide:user" size="32" class="welcome__avatar-placeholder" />
          <div class="welcome__avatar-overlay">
            <Icon :name="avatarUploading ? 'lucide:loader-2' : 'lucide:camera'" size="16" :class="{ 'welcome__spin': avatarUploading }" />
          </div>
        </div>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="welcome__avatar-input"
          @change="onAvatarUpload"
        />
        <span class="welcome__avatar-hint">{{ t('welcome.avatarHint') }}</span>
      </div>

      <!-- Name -->
      <div class="welcome__field">
        <label class="welcome__label">{{ t('welcome.nameLabel') }}</label>
        <input
          v-model="displayName"
          type="text"
          class="welcome__input"
          :placeholder="t('welcome.namePlaceholder')"
          maxlength="100"
          autofocus
          @keydown.enter="finish"
        />
      </div>

      <!-- Actions -->
      <div class="welcome__actions">
        <AppButton variant="primary" size="lg" :loading="saving" @click="finish" class="welcome__continue">
          {{ t('welcome.continue') }}
        </AppButton>
        <button class="welcome__skip" @click="skip">{{ t('welcome.skip') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: var(--space-6);
}

.welcome__card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.welcome__header {
  text-align: center;
}

.welcome__emoji {
  font-size: 48px;
  display: block;
  margin-bottom: var(--space-3);
}

.welcome__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.welcome__desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Avatar */
.welcome__avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.welcome__avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border-light);
  overflow: hidden;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.welcome__avatar:hover {
  border-color: var(--color-accent);
}

.welcome__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.welcome__avatar-placeholder {
  position: absolute;
  inset: 0;
  margin: auto;
  color: var(--color-text-muted);
}

.welcome__avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.welcome__avatar:hover .welcome__avatar-overlay {
  opacity: 1;
}

.welcome__avatar-input {
  display: none;
}

.welcome__avatar-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Name field */
.welcome__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.welcome__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.welcome__input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
  text-align: center;
  transition: all var(--transition-fast);
}

.welcome__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 12%, transparent);
}

/* Actions */
.welcome__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.welcome__continue {
  width: 100%;
}

.welcome__skip {
  border: none;
  background: none;
  font: inherit;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-1);
  transition: color var(--transition-fast);
}

.welcome__skip:hover {
  color: var(--color-text-primary);
}

.welcome__spin {
  animation: welcome-spin 0.6s linear infinite;
}

@keyframes welcome-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
