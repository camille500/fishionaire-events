<script setup>
const { t } = useI18n()
const { usage, percentage, isNearLimit, isAtLimit } = useAiTokenUsage()

const barColor = computed(() => {
  if (isAtLimit.value) return 'var(--color-error)'
  if (isNearLimit.value) return 'var(--color-warning)'
  return 'var(--color-accent)'
})

function formatTokens(n) {
  if (!n) return '0'
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return n.toString()
}
</script>

<template>
  <div v-if="usage" class="ai-usage-bar">
    <div class="ai-usage-bar__header">
      <span class="ai-usage-bar__label">{{ t('ai.usage.label') }}</span>
      <span class="ai-usage-bar__count">
        {{ formatTokens(usage.tokensUsed) }} / {{ formatTokens(usage.limit) }}
      </span>
    </div>
    <div class="ai-usage-bar__track">
      <div
        class="ai-usage-bar__fill"
        :style="{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }"
      />
    </div>
    <p v-if="isAtLimit" class="ai-usage-bar__warning">
      {{ t('ai.usage.limitReached') }}
    </p>
  </div>
</template>

<style scoped>
.ai-usage-bar {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.ai-usage-bar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ai-usage-bar__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.ai-usage-bar__count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.ai-usage-bar__track {
  height: 6px;
  border-radius: 3px;
  background: var(--color-background-alt);
  overflow: hidden;
}

.ai-usage-bar__fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease, background-color 0.3s ease;
  min-width: 2px;
}

.ai-usage-bar__warning {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--color-error);
  font-weight: 500;
}
</style>
