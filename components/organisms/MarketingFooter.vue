<script setup>
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <span class="logo-icon">🎉</span>
          <span class="logo-text">Fishion</span><span class="logo-accent">aire</span>
        </div>
        <p class="footer-tagline">{{ t('footer.tagline') }}</p>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">{{ t('footer.product') }}</h4>
        <NuxtLink :to="localePath('features')">{{ t('footer.features') }}</NuxtLink>
        <NuxtLink :to="localePath('pricing')">{{ t('footer.pricing') }}</NuxtLink>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">{{ t('footer.support') }}</h4>
        <NuxtLink :to="localePath('help')">{{ t('footer.helpCenter') }}</NuxtLink>
        <a href="mailto:hello@fishionaire.events">{{ t('footer.contact') }}</a>
      </div>

      <div class="footer-col footer-trust">
        <h4 class="footer-heading">{{ t('footer.legal') }}</h4>
        <div class="trust-badges">
          <span class="badge">{{ t('footer.privacy') }}</span>
          <span class="badge">{{ t('footer.terms') }}</span>
          <span class="badge">SSL</span>
          <span class="badge">GDPR</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ year }} Fishionaire. {{ t('footer.copyright') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border-glass);
  padding: 64px 24px 32px;
  position: relative;
  z-index: 1;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 48px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-family-heading);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 12px;
}

.logo-icon { font-size: 1.3rem; }
.logo-text { color: var(--text-primary); }
.logo-accent { color: var(--color-accent); }

.footer-tagline {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 280px;
}

.footer-heading {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col a {
  font-size: 0.875rem;
  color: var(--text-muted);
  transition: color 0.2s ease;
  text-decoration: none;
}

.footer-col a:hover { color: var(--color-accent); }

.trust-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.badge {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 4px 10px;
  border: 1px solid var(--border-glass);
  border-radius: 6px;
  width: fit-content;
  font-weight: 500;
}

.footer-bottom {
  max-width: 1280px;
  margin: 48px auto 0;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle);
  text-align: center;
}

.footer-bottom p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
