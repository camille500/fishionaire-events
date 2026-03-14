<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="editor-prop">
    <span class="editor-prop__label">
      <Icon v-if="icon" :name="icon" size="14" />
      {{ label }}
    </span>
    <div class="editor-prop__value">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.editor-prop {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-3);
  margin: 0 calc(-1 * var(--space-3));
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.editor-prop:hover {
  background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
}

.editor-prop + .editor-prop {
  border-top: 1px solid color-mix(in srgb, var(--color-border-light) 40%, transparent);
}

.editor-prop__label {
  width: 160px;
  flex-shrink: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.editor-prop__value {
  flex: 1;
  min-width: 0;
}

@media (max-width: 640px) {
  .editor-prop {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .editor-prop__label {
    width: auto;
  }

  .editor-prop__value {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .editor-prop {
    transition: none;
  }
}
</style>
