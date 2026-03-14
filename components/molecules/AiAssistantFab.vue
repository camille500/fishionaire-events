<script setup>
const { t } = useI18n()

defineProps({
  locked: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['suggest-title', 'suggest-activities', 'suggest-timeline', 'write-description'])

const open = ref(false)

const actions = computed(() => [
  { key: 'title', icon: 'lucide:type', label: t('editor.ai.suggestTitle'), event: 'suggest-title' },
  { key: 'activities', icon: 'lucide:layers', label: t('editor.ai.suggestActivities'), event: 'suggest-activities' },
  { key: 'timeline', icon: 'lucide:clock', label: t('editor.ai.suggestTimeline'), event: 'suggest-timeline' },
  { key: 'description', icon: 'lucide:pen-line', label: t('editor.ai.writeDescription'), event: 'write-description' },
])

function onAction(action) {
  open.value = false
  emit(action.event)
}

function onClickOutside() {
  open.value = false
}
</script>

<template>
  <div v-if="!locked" class="ai-fab-wrapper" v-on-click-outside="onClickOutside">
    <Transition name="ai-fab-menu">
      <div v-if="open" class="ai-fab__menu">
        <button
          v-for="action in actions"
          :key="action.key"
          type="button"
          class="ai-fab__action"
          @click="onAction(action)"
        >
          <Icon :name="action.icon" size="14" />
          {{ action.label }}
        </button>
      </div>
    </Transition>

    <button
      type="button"
      class="ai-fab"
      :class="{ 'ai-fab--open': open }"
      @click="open = !open"
    >
      <Icon name="lucide:sparkles" size="20" />
    </button>
  </div>
</template>

<style scoped>
.ai-fab-wrapper {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.ai-fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--gradient-accent);
  color: white;
  cursor: pointer;
  box-shadow: var(--shadow-accent-lg);
  transition: all var(--transition-base);
}

.ai-fab:hover {
  transform: scale(1.08);
  box-shadow: var(--shadow-accent-lg), 0 0 30px var(--color-accent-bg);
}

.ai-fab--open {
  transform: rotate(45deg);
}

.ai-fab--open:hover {
  transform: rotate(45deg) scale(1.08);
}

.ai-fab__menu {
  display: flex;
  flex-direction: column;
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
}

.ai-fab__action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.ai-fab__action:hover {
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

/* Transitions */
.ai-fab-menu-enter-active {
  transition: all 200ms ease-out;
}

.ai-fab-menu-leave-active {
  transition: all 150ms ease-in;
}

.ai-fab-menu-enter-from,
.ai-fab-menu-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

@media (max-width: 640px) {
  .ai-fab-wrapper {
    bottom: var(--space-4);
    right: var(--space-4);
  }

  .ai-fab {
    width: 44px;
    height: 44px;
  }
}
</style>
