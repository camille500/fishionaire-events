<script setup>
defineProps({
  yesCount: { type: Number, default: 0 },
  maybeCount: { type: Number, default: 0 },
  noCount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  isWinner: { type: Boolean, default: false },
})
</script>

<template>
  <div class="result-bar" :class="{ 'result-bar--winner': isWinner }">
    <div class="result-bar__track" v-if="total > 0">
      <div
        class="result-bar__segment result-bar__segment--yes"
        :style="{ width: `${(yesCount / total) * 100}%` }"
      />
      <div
        class="result-bar__segment result-bar__segment--maybe"
        :style="{ width: `${(maybeCount / total) * 100}%` }"
      />
      <div
        class="result-bar__segment result-bar__segment--no"
        :style="{ width: `${(noCount / total) * 100}%` }"
      />
    </div>
    <div v-else class="result-bar__empty" />

    <div class="result-bar__counts">
      <span v-if="yesCount > 0" class="result-bar__count result-bar__count--yes">
        <Icon name="lucide:check" size="11" />{{ yesCount }}
      </span>
      <span v-if="maybeCount > 0" class="result-bar__count result-bar__count--maybe">
        <Icon name="lucide:minus" size="11" />{{ maybeCount }}
      </span>
      <span v-if="noCount > 0" class="result-bar__count result-bar__count--no">
        <Icon name="lucide:x" size="11" />{{ noCount }}
      </span>
      <span v-if="total === 0" class="result-bar__count result-bar__count--empty">—</span>
    </div>
  </div>
</template>

<style scoped>
.result-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.result-bar__track {
  flex: 1;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-border-light);
  display: flex;
  overflow: hidden;
}

.result-bar__empty {
  flex: 1;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-border-light);
}

.result-bar__segment {
  height: 100%;
  transition: width var(--transition-base);
}

.result-bar__segment--yes { background: #22c55e; }
.result-bar__segment--maybe { background: #f59e0b; }
.result-bar__segment--no { background: var(--color-border); }

.result-bar--winner .result-bar__segment--yes { background: var(--color-accent); }

.result-bar__counts {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.result-bar__count {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.result-bar__count--yes { color: #22c55e; }
.result-bar__count--maybe { color: #f59e0b; }
.result-bar__count--no { color: var(--color-text-muted); }
.result-bar__count--empty { color: var(--color-text-muted); }

.result-bar--winner .result-bar__count--yes { color: var(--color-accent); }
</style>
