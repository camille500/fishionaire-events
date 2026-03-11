<script setup>
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const otherLocale = computed(() => {
  return locales.value.find((l) => l.code !== locale.value)
})
</script>

<template>
  <NuxtLink
    v-if="otherLocale"
    :to="switchLocalePath(otherLocale.code)"
    class="language-switcher"
  >
    {{ otherLocale.code.toUpperCase() }}
  </NuxtLink>
</template>

<style scoped>
.language-switcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  text-decoration: none;
  transition: all var(--transition-fast);
  min-width: 2.5rem;
  text-align: center;
}

.language-switcher:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}
</style>
