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
        <span class="marketing-nav__logo-icon">🎉</span>
        <span class="marketing-nav__logo-text">Fishionaire</span>
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
        <AppButton variant="gradient" :to="localePath('/sign-up')" size="sm">
          {{ t('nav.getStarted') }}
        </AppButton>
      </div>

      <button
        class="marketing-nav__hamburger"
        :class="{ 'marketing-nav__hamburger--open': menuOpen }"
        @click="toggleMenu"
        aria-label="Menu"
      >
        <Icon :name="menuOpen ? 'lucide:x' : 'lucide:menu'" size="24" />
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
          <AppButton variant="gradient" :to="localePath('/sign-up')" size="sm" @click="menuOpen = false">
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: all var(--transition-base);
}

.marketing-nav--scrolled {
  background: var(--glass-bg-strong);
  border-bottom-color: var(--color-border-light);
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
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  transition: transform var(--transition-fast);
}

.marketing-nav__logo:hover {
  transform: scale(1.03);
}

.marketing-nav__logo-icon {
  font-size: 1.5rem;
}

.marketing-nav__logo-text {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
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
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.marketing-nav__hamburger:hover {
  background: var(--color-background-alt);
}

/* Mobile menu */
.marketing-nav__mobile {
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--color-border-light);
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
  transition: color var(--transition-fast);
}

.marketing-nav__mobile-links a:hover {
  color: var(--color-accent);
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
