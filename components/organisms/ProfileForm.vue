<script setup>
const { t } = useI18n()
const { user: clerkUser } = useUser()
const { profile, saving, error, updateProfile, uploadAvatar, deleteAvatar } = useProfile()

const form = reactive({
  displayName: '',
  bio: '',
  website: '',
  socialInstagram: '',
  socialTwitter: '',
  socialLinkedin: '',
  profileVisible: true,
})

const avatarUploading = ref(false)
const saved = ref(false)

watch(profile, (val) => {
  if (!val) return
  form.displayName = val.displayName || ''
  form.bio = val.bio || ''
  form.website = val.website || ''
  form.socialInstagram = val.socialInstagram || ''
  form.socialTwitter = val.socialTwitter || ''
  form.socialLinkedin = val.socialLinkedin || ''
  form.profileVisible = val.profileVisible ?? true
}, { immediate: true })

const bioLength = computed(() => form.bio.length)

const avatarSrc = computed(() => {
  return profile.value?.avatarUrl || clerkUser.value?.imageUrl || null
})

const displayName = computed(() => {
  return profile.value?.displayName || clerkUser.value?.firstName || ''
})

async function onSave() {
  saved.value = false
  await updateProfile({ ...form })
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

async function onAvatarUpload(blob) {
  avatarUploading.value = true
  try {
    await uploadAvatar(blob)
  } finally {
    avatarUploading.value = false
  }
}

async function onAvatarRemove() {
  avatarUploading.value = true
  try {
    await deleteAvatar()
  } finally {
    avatarUploading.value = false
  }
}
</script>

<template>
  <div class="profile-form">
    <!-- Avatar Section -->
    <div class="profile-form__section profile-form__section--avatar">
      <AvatarUpload
        :src="avatarSrc"
        :name="displayName"
        :uploading="avatarUploading"
        @upload="onAvatarUpload"
      />
      <button
        v-if="profile?.avatarUrl"
        class="profile-form__avatar-remove"
        @click="onAvatarRemove"
      >
        {{ t('dashboard.profile.avatar.remove') }}
      </button>
    </div>

    <!-- Display Name -->
    <div class="profile-form__section">
      <h2 class="profile-form__section-title">{{ t('dashboard.profile.displayName') }}</h2>
      <AppInput
        v-model="form.displayName"
        :placeholder="t('dashboard.profile.displayNamePlaceholder')"
        icon="lucide:user"
      />
    </div>

    <!-- Bio -->
    <div class="profile-form__section">
      <h2 class="profile-form__section-title">{{ t('dashboard.profile.bio') }}</h2>
      <AppTextarea
        v-model="form.bio"
        :placeholder="t('dashboard.profile.bioPlaceholder')"
        :rows="3"
      />
      <span class="profile-form__char-count" :class="{ 'profile-form__char-count--warn': bioLength > 450 }">
        {{ bioLength }} / 500
      </span>
    </div>

    <!-- Social Links -->
    <div class="profile-form__section">
      <h2 class="profile-form__section-title">{{ t('dashboard.profile.socialLinks') }}</h2>
      <div class="profile-form__social-grid">
        <AppInput
          v-model="form.socialInstagram"
          :placeholder="t('dashboard.profile.instagram')"
          icon="lucide:instagram"
        />
        <AppInput
          v-model="form.socialTwitter"
          :placeholder="t('dashboard.profile.twitter')"
          icon="lucide:twitter"
        />
        <AppInput
          v-model="form.socialLinkedin"
          :placeholder="t('dashboard.profile.linkedin')"
          icon="lucide:linkedin"
        />
        <AppInput
          v-model="form.website"
          :placeholder="t('dashboard.profile.website')"
          icon="lucide:globe"
        />
      </div>
    </div>

    <!-- Visibility -->
    <div class="profile-form__section">
      <AppSwitch
        v-model="form.profileVisible"
        :label="t('dashboard.profile.visibility')"
        :description="t('dashboard.profile.visibilityDescription')"
      />
    </div>

    <!-- Error -->
    <p v-if="error" class="profile-form__error">{{ error }}</p>

    <!-- Save -->
    <div class="profile-form__actions">
      <AppButton variant="primary" :loading="saving" @click="onSave">
        {{ saved ? t('dashboard.profile.saved') : t('dashboard.profile.save') }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.profile-form__section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.profile-form__section--avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.profile-form__avatar-remove {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.profile-form__avatar-remove:hover {
  color: var(--color-error);
  background: rgba(255, 107, 107, 0.1);
}

.profile-form__section-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4);
}

.profile-form__char-count {
  display: block;
  text-align: right;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

.profile-form__char-count--warn {
  color: var(--color-warning);
}

.profile-form__social-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .profile-form__social-grid {
    grid-template-columns: 1fr;
  }
}

.profile-form__error {
  font-size: var(--text-sm);
  color: var(--color-error);
  margin: 0;
}

.profile-form__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
