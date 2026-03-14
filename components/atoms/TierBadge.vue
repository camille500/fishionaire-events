<script setup>
const { t } = useI18n()

defineProps({
  tier: {
    type: String,
    required: true,
    validator: (v) => ['free', 'standard', 'pro'].includes(v),
  },
})

const iconMap = {
  free: '',
  standard: 'lucide:star',
  pro: 'lucide:crown',
}
</script>

<template>
  <span class="tier-badge" :class="`tier-badge--${tier}`">
    <Icon v-if="iconMap[tier]" :name="iconMap[tier]" size="12" />
    {{ t(`tiers.${tier}`) }}
  </span>
</template>

<style scoped>
.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tier-badge--free {
  background: var(--color-neutral-100, var(--color-background-alt));
  color: var(--color-neutral-600, var(--color-text-secondary));
}

.tier-badge--standard {
  background: color-mix(in srgb, var(--color-info) 12%, transparent);
  color: var(--color-info);
}

.tier-badge--pro {
  background: color-mix(in srgb, var(--color-accent-gold) 12%, transparent);
  color: var(--color-accent-gold);
}
</style>
