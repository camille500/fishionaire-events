<script setup>
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const sections = ref(props.modelValue.length > 0
  ? JSON.parse(JSON.stringify(props.modelValue))
  : []
)

function addSection() {
  sections.value.push({ name: '', items: [] })
  emitUpdate()
}

function removeSection(index) {
  sections.value.splice(index, 1)
  emitUpdate()
}

function addItem(sectionIndex) {
  sections.value[sectionIndex].items.push({ name: '', description: '', tags: [] })
  emitUpdate()
}

function removeItem(sectionIndex, itemIndex) {
  sections.value[sectionIndex].items.splice(itemIndex, 1)
  emitUpdate()
}

function emitUpdate() {
  emit('update:modelValue', JSON.parse(JSON.stringify(sections.value)))
}
</script>

<template>
  <div class="menu-editor">
    <div v-for="(section, si) in sections" :key="si" class="menu-editor__section">
      <div class="menu-editor__section-header">
        <AppInput
          v-model="section.name"
          :placeholder="t('editor.menu.sectionName')"
          :disabled="disabled"
          @blur="emitUpdate"
        />
        <button type="button" class="menu-editor__remove" @click="removeSection(si)" :disabled="disabled">
          <Icon name="lucide:x" size="12" />
        </button>
      </div>

      <div v-for="(item, ii) in section.items" :key="ii" class="menu-editor__item">
        <div class="menu-editor__item-fields">
          <AppInput
            v-model="item.name"
            :placeholder="t('editor.menu.itemName')"
            :disabled="disabled"
            @blur="emitUpdate"
          />
          <AppInput
            v-model="item.description"
            :placeholder="t('editor.menu.itemDesc')"
            :disabled="disabled"
            @blur="emitUpdate"
          />
        </div>
        <button type="button" class="menu-editor__remove" @click="removeItem(si, ii)" :disabled="disabled">
          <Icon name="lucide:x" size="12" />
        </button>
      </div>

      <button type="button" class="menu-editor__add-item" @click="addItem(si)" :disabled="disabled">
        <Icon name="lucide:plus" size="12" />
        {{ t('editor.menu.addItem') }}
      </button>
    </div>

    <button type="button" class="menu-editor__add-section" @click="addSection" :disabled="disabled">
      <Icon name="lucide:plus" size="14" />
      {{ t('editor.menu.addSection') }}
    </button>
  </div>
</template>

<style scoped>
.menu-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.menu-editor__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.menu-editor__section-header {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.menu-editor__item {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
  padding-left: var(--space-3);
}

.menu-editor__item-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.menu-editor__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.menu-editor__remove:hover {
  background: color-mix(in srgb, var(--color-error, #ef4444) 10%, transparent);
  color: var(--color-error, #ef4444);
}

.menu-editor__add-item,
.menu-editor__add-section {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.menu-editor__add-item:hover,
.menu-editor__add-section:hover {
  opacity: 0.8;
}

.menu-editor__add-section {
  padding: var(--space-2) var(--space-3);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-md);
}
</style>
