<script setup>
const { t } = useI18n()

defineProps({
  tier: {
    type: String,
    required: true,
    validator: (v) => ['free', 'standard', 'pro'].includes(v),
  },
})
</script>

<template>
  <span class="tier-badge" :class="`tier-badge--${tier}`">
    {{ t(`tiers.${tier}`) }}
  </span>
</template>

<style scoped>
.tier-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tier-badge--free {
  background: var(--color-background-alt);
  color: var(--color-text-secondary);
}

.tier-badge--standard {
  background: #e8f4fd;
  color: #1a73e8;
}

.tier-badge--pro {
  background: #fef3e2;
  color: #e8760a;
}
</style>
