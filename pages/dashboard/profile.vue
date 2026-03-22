<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()

useHead({ title: () => t('seo.profile.title') })
</script>

<template>
  <div class="profile-page">
    <h1 class="profile-page__title">{{ t('dashboard.profile.title') }}</h1>
    <ProfileForm />
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 860px;
  margin: 0 auto;
}

.profile-page__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}
</style>
