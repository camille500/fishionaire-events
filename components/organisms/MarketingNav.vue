<script setup>
const { t } = useI18n()
const localePath = useLocalePath()

const menuOpen = ref(false)
const scrolled = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 20
  })
})
</script>

<template>
  <header class="marketing-nav" :class="{ 'marketing-nav--scrolled': scrolled }">
    <div class="marketing-nav__container">
      <NuxtLink :to="localePath('/')" class="marketing-nav__logo">
        Fishionaire Events
      </NuxtLink>

      <nav class="marketing-nav__links">
        <NavLink :to="localePath('features')" :label="t('nav.features')" />
        <NavLink :to="localePath('pricing')" :label="t('nav.pricing')" />
        <NavLink :to="localePath('help')" :label="t('nav.help')" />
      </nav>

      <div class="marketing-nav__actions">
        <LanguageSwitcher />
        <AppButton variant="ghost" :to="localePath('/sign-in')" size="sm">
          {{ t('nav.signIn') }}
        </AppButton>
        <AppButton variant="primary" :to="localePath('/sign-up')" size="sm">
          {{ t('nav.getStarted') }}
        </AppButton>
      </div>

      <button
        class="marketing-nav__hamburger"
        :class="{ 'marketing-nav__hamburger--open': menuOpen }"
        @click="toggleMenu"
        aria-label="Menu"
      >
        <AppIcon :name="menuOpen ? 'x' : 'menu'" />
      </button>
    </div>

    <Transition name="dropdown">
      <div v-if="menuOpen" class="marketing-nav__mobile">
        <nav class="marketing-nav__mobile-links">
          <NuxtLink :to="localePath('features')" @click="menuOpen = false">
            {{ t('nav.features') }}
          </NuxtLink>
          <NuxtLink :to="localePath('pricing')" @click="menuOpen = false">
            {{ t('nav.pricing') }}
          </NuxtLink>
          <NuxtLink :to="localePath('help')" @click="menuOpen = false">
            {{ t('nav.help') }}
          </NuxtLink>
        </nav>
        <div class="marketing-nav__mobile-actions">
          <LanguageSwitcher />
          <AppButton variant="ghost" :to="localePath('/sign-in')" size="sm" @click="menuOpen = false">
            {{ t('nav.signIn') }}
          </AppButton>
          <AppButton variant="primary" :to="localePath('/sign-up')" size="sm" @click="menuOpen = false">
            {{ t('nav.getStarted') }}
          </AppButton>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.marketing-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  transition: box-shadow var(--transition-base);
}

.marketing-nav--scrolled {
  box-shadow: var(--shadow-sm);
}

.marketing-nav__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.marketing-nav__logo {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-decoration: none;
}

.marketing-nav__links {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.marketing-nav__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.marketing-nav__hamburger {
  display: none;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: var(--space-2);
}

/* Mobile menu */
.marketing-nav__mobile {
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--color-border);
}

.marketing-nav__mobile-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.marketing-nav__mobile-links a {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--space-2) 0;
}

.marketing-nav__mobile-links a:hover {
  color: var(--color-text-primary);
}

.marketing-nav__mobile-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-base);
  overflow: hidden;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .marketing-nav__links,
  .marketing-nav__actions {
    display: none;
  }

  .marketing-nav__hamburger {
    display: flex;
  }
}
</style>
