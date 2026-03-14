<script setup>
const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()

const menuOpen = ref(false)
const scrolled = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 40
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
</script>

<template>
  <header class="header" :class="{ scrolled }">
    <div class="header-inner">
      <NuxtLink :to="localePath('/')" class="logo">
        <span class="logo-icon">🎉</span>
        <span class="logo-text">Fishion</span><span class="logo-accent">aire</span>
      </NuxtLink>

      <nav class="nav" :class="{ 'nav-open': menuOpen }">
        <NuxtLink :to="localePath('features')" class="nav-link" @click="closeMenu">{{ t('nav.features') }}</NuxtLink>
        <NuxtLink :to="localePath('pricing')" class="nav-link" @click="closeMenu">{{ t('nav.pricing') }}</NuxtLink>
        <NuxtLink :to="localePath('help')" class="nav-link" @click="closeMenu">{{ t('nav.help') }}</NuxtLink>
      </nav>

      <div class="header-actions">
        <LanguageSwitcher />
        <UColorModeButton />

        <template v-if="isSignedIn">
          <NuxtLink to="/dashboard" class="header-cta btn-magnetic">
            <span>{{ t('nav.dashboard') }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink :to="localePath('/sign-in')" class="header-signin">
            {{ t('nav.signIn') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/sign-up')" class="header-cta btn-magnetic">
            <span>{{ t('nav.getStarted') }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </template>

        <button
          class="hamburger"
          :class="{ 'is-open': menuOpen }"
          @click="toggleMenu"
          aria-label="Menu"
          :aria-expanded="menuOpen.toString()"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 24px;
  transition: background 0.4s ease, border-color 0.4s ease, padding 0.3s ease;
  border-bottom: 1px solid transparent;
}

.header.scrolled {
  background: var(--header-bg-scrolled);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom-color: var(--border-glass);
  padding: 10px 24px;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-family-heading);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.logo-icon { font-size: 1.3rem; }
.logo-text { color: var(--text-primary); }
.logo-accent { color: var(--color-accent); }

.nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.25s ease;
  position: relative;
  text-decoration: none;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.nav-link:hover { color: var(--text-primary); }
.nav-link:hover::after { width: 100%; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-signin {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s ease;
  text-decoration: none;
}

.header-signin:hover { color: var(--color-accent); }

.header-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bg-deep);
  background: var(--color-accent);
  border-radius: 6px;
  transition: transform 0.25s ease, box-shadow 0.35s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.header-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.header-cta:hover::before { transform: translateX(100%); }
.header-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 184, 148, 0.35); }
.header-cta svg { transition: transform 0.2s ease; }
.header-cta:hover svg { transform: translateX(3px); }

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 101;
}

.hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger.is-open .hamburger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.is-open .hamburger-line:nth-child(2) { opacity: 0; }
.hamburger.is-open .hamburger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

@media (max-width: 768px) {
  .nav {
    display: none;
    position: fixed;
    inset: 0;
    background: var(--mobile-nav-bg);
    backdrop-filter: blur(24px);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    z-index: 100;
  }

  .nav.nav-open { display: flex; }
  .nav-link { font-size: 1.25rem; }
  .hamburger { display: flex; }
  .header-cta { display: none; }
  .header-signin { display: none; }
}
</style>
