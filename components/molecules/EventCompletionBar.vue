<script setup>
const { t } = useI18n()

const props = defineProps({
  percent: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
})

const missingItems = computed(() => props.items.filter((i) => !i.done))
const showTooltip = ref(false)
</script>

<template>
  <div
    v-if="percent < 100"
    class="completion-bar"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <div class="completion-bar__track">
      <div
        class="completion-bar__fill"
        :style="{ width: percent + '%' }"
      />
    </div>
    <span class="completion-bar__label">{{ percent }}% {{ t('editor.completion.complete') }}</span>

    <Transition name="fade">
      <div v-if="showTooltip && missingItems.length > 0" class="completion-bar__tooltip">
        <span class="completion-bar__tooltip-title">{{ t('editor.completion.missing') }}</span>
        <ul class="completion-bar__tooltip-list">
          <li v-for="item in missingItems" :key="item.key">
            {{ t(`editor.completion.fields.${item.key}`) }}
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.completion-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  position: relative;
  padding: var(--space-2) 0;
}

.completion-bar__track {
  flex: 1;
  height: 4px;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.completion-bar__fill {
  height: 100%;
  background: var(--gradient-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.completion-bar__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.completion-bar__tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  margin-top: var(--space-1);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  min-width: 180px;
}

.completion-bar__tooltip-title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--space-2);
}

.completion-bar__tooltip-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.completion-bar__tooltip-list li {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.completion-bar__tooltip-list li::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-warning);
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
