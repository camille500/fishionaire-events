<script setup>
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="marketing-footer">
    <div class="marketing-footer__container">
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
  padding: var(--space-16) 0 var(--space-8);
}

.marketing-footer__container {
  max-width: var(--max-width-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.marketing-footer__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

.marketing-footer__heading {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-4);
  opacity: 0.6;
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
  opacity: 0.8;
  transition: opacity var(--transition-fast);
}

.marketing-footer__links a:hover {
  opacity: 1;
}

.marketing-footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--space-8);
  font-size: var(--text-sm);
  opacity: 0.5;
  text-align: center;
}

@media (max-width: 768px) {
  .marketing-footer__grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}
</style>
