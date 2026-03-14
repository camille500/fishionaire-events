<script setup>
const { t } = useI18n()

const items = computed(() => [
  { icon: 'lucide:zap', stat: t('home.strip.1.stat'), label: t('home.strip.1.label'), counter: null },
  { icon: 'lucide:check-circle', stat: t('home.strip.2.stat'), label: t('home.strip.2.label'), counter: { value: '98', suffix: '%' } },
  { icon: 'lucide:star', stat: t('home.strip.3.stat'), label: t('home.strip.3.label'), counter: { value: '4.9', suffix: '' } },
  { icon: 'lucide:clock', stat: t('home.strip.4.stat'), label: t('home.strip.4.label'), counter: null },
  { icon: 'lucide:users', stat: t('home.strip.5.stat'), label: t('home.strip.5.label'), counter: { value: '10000', suffix: '+' } },
])
</script>

<template>
  <section class="features-strip-section">
    <div class="features-strip">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="feature-item reveal"
      >
        <div class="feature-icon">
          <Icon :name="item.icon" size="20" />
        </div>
        <div
          v-if="item.counter"
          class="feature-number"
          :data-counter-value="item.counter.value"
          :data-counter-suffix="item.counter.suffix"
        >0{{ item.counter.suffix }}</div>
        <div v-else class="feature-number">{{ item.stat }}</div>
        <div class="feature-label">{{ item.label }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-strip-section {
  border-top: 1px solid var(--border-glass);
  border-bottom: 1px solid var(--border-glass);
  padding: 64px 24px;
}

.features-strip {
  display: flex;
  justify-content: center;
  gap: 80px;
  flex-wrap: wrap;
  max-width: 1280px;
  margin: 0 auto;
}

.feature-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.feature-icon {
  color: var(--color-accent);
  margin-bottom: 4px;
  opacity: 0.7;
}

.feature-number {
  font-family: var(--font-family-heading);
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-violet));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.feature-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 900px) {
  .features-strip { gap: 40px; }
}
</style>
