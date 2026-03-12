<script setup>
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="marketing-footer">
    <!-- Wave divider -->
    <div class="marketing-footer__wave" aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="currentColor" />
      </svg>
    </div>
    <div class="marketing-footer__container">
      <div class="marketing-footer__top">
        <div class="marketing-footer__brand">
          <span class="marketing-footer__logo">🎉 Fishionaire</span>
          <p class="marketing-footer__tagline">{{ t('footer.tagline') }}</p>
        </div>
        <div class="marketing-footer__grid">
          <div class="marketing-footer__section">
            <h4 class="marketing-footer__heading">{{ t('footer.product') }}</h4>
            <nav class="marketing-footer__links">
              <NuxtLink :to="localePath('features')">{{ t('footer.features') }}</NuxtLink>
              <NuxtLink :to="localePath('pricing')">{{ t('footer.pricing') }}</NuxtLink>
            </nav>
          </div>
          <div class="marketing-footer__section">
            <h4 class="marketing-footer__heading">{{ t('footer.support') }}</h4>
            <nav class="marketing-footer__links">
              <NuxtLink :to="localePath('help')">{{ t('footer.helpCenter') }}</NuxtLink>
              <a href="mailto:hello@fishionaire.events">{{ t('footer.contact') }}</a>
            </nav>
          </div>
          <div class="marketing-footer__section">
            <h4 class="marketing-footer__heading">{{ t('footer.legal') }}</h4>
            <nav class="marketing-footer__links">
              <a href="#">{{ t('footer.privacy') }}</a>
              <a href="#">{{ t('footer.terms') }}</a>
            </nav>
          </div>
        </div>
      </div>
      <div class="marketing-footer__bottom">
        <span>{{ t('footer.copyright') }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.marketing-footer {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 0 0 var(--space-8);
  position: relative;
}

.marketing-footer__wave {
  color: var(--color-primary);
  margin-top: -1px;
  line-height: 0;
  position: relative;
  top: -79px;
  margin-bottom: -79px;
}

.marketing-footer__wave svg {
  width: 100%;
  height: 80px;
}

.marketing-footer__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: var(--space-12) var(--space-6) 0;
}

.marketing-footer__top {
  display: flex;
  gap: var(--space-16);
  margin-bottom: var(--space-12);
}

.marketing-footer__brand {
  min-width: 200px;
}

.marketing-footer__logo {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  display: block;
  margin-bottom: var(--space-2);
}

.marketing-footer__tagline {
  font-size: var(--text-sm);
  opacity: 0.5;
  max-width: 200px;
  line-height: var(--line-height-normal);
}

.marketing-footer__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  flex: 1;
}

.marketing-footer__heading {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.marketing-footer__links {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.marketing-footer__links a {
  color: var(--color-text-inverse);
  text-decoration: none;
  font-size: var(--text-sm);
  opacity: 0.75;
  transition: all var(--transition-fast);
  position: relative;
  display: inline-block;
}

.marketing-footer__links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition: width var(--transition-base);
}

.marketing-footer__links a:hover {
  opacity: 1;
  color: var(--color-accent-light);
}

.marketing-footer__links a:hover::after {
  width: 100%;
}

.marketing-footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: var(--space-8);
  font-size: var(--text-sm);
  opacity: 0.4;
  text-align: center;
}

@media (max-width: 768px) {
  .marketing-footer__top {
    flex-direction: column;
    gap: var(--space-8);
  }

  .marketing-footer__grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}
</style>
