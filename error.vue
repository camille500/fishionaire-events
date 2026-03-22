<script setup>
const { t } = useI18n()

const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
})

const is404 = computed(() => props.error?.statusCode === 404)

const handleAction = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error-page">
    <div class="error-page__card">
      <div class="error-page__code">{{ error?.statusCode || 500 }}</div>
      <h1 class="error-page__title">
        {{ is404 ? t('error.notFound') : t('error.generic') }}
      </h1>
      <p class="error-page__description">
        {{ is404 ? t('error.notFoundDescription') : t('error.genericDescription') }}
      </p>
      <button class="error-page__button" @click="handleAction">
        {{ t('error.backHome') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-deep, #0a0a1a);
  padding: 2rem;
}

.error-page__card {
  text-align: center;
  max-width: 480px;
}

.error-page__code {
  font-size: 6rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-accent, #ff6b6b), var(--color-accent-light, #ff8e8e));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;
}

.error-page__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
  margin-bottom: 0.75rem;
}

.error-page__description {
  color: var(--color-text-muted, #8a8aa3);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-page__button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 2rem;
  background: var(--color-accent, #ff6b6b);
  color: #fff;
  border: none;
  border-radius: var(--radius-lg, 12px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.error-page__button:hover {
  opacity: 0.9;
}
</style>
