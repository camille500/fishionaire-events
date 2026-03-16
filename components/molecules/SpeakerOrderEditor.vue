<script setup>
import { VueDraggable } from 'vue-draggable-plus'

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

const speakers = ref(props.modelValue.length > 0
  ? JSON.parse(JSON.stringify(props.modelValue))
  : []
)

function addSpeaker() {
  speakers.value.push({ name: '', role: '' })
  emitUpdate()
}

function removeSpeaker(index) {
  speakers.value.splice(index, 1)
  emitUpdate()
}

function emitUpdate() {
  emit('update:modelValue', JSON.parse(JSON.stringify(speakers.value)))
}
</script>

<template>
  <div class="speaker-editor">
    <VueDraggable
      v-model="speakers"
      :animation="150"
      handle=".speaker-editor__drag"
      :disabled="disabled"
      class="speaker-editor__list"
      @end="emitUpdate"
    >
      <div v-for="(speaker, index) in speakers" :key="index" class="speaker-editor__item">
        <div class="speaker-editor__drag" v-if="!disabled">
          <Icon name="lucide:grip-vertical" size="12" />
        </div>
        <div class="speaker-editor__fields">
          <AppInput
            v-model="speaker.name"
            :placeholder="t('editor.speakers.name')"
            :disabled="disabled"
            @blur="emitUpdate"
          />
          <AppInput
            v-model="speaker.role"
            :placeholder="t('editor.speakers.role')"
            :disabled="disabled"
            @blur="emitUpdate"
          />
        </div>
        <button type="button" class="speaker-editor__remove" @click="removeSpeaker(index)" :disabled="disabled">
          <Icon name="lucide:x" size="12" />
        </button>
      </div>
    </VueDraggable>

    <button type="button" class="speaker-editor__add" @click="addSpeaker" :disabled="disabled">
      <Icon name="lucide:plus" size="14" />
      {{ t('editor.speakers.add') }}
    </button>
  </div>
</template>

<style scoped>
.speaker-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.speaker-editor__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.speaker-editor__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.speaker-editor__drag {
  color: var(--color-text-muted);
  cursor: grab;
  flex-shrink: 0;
}

.speaker-editor__fields {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.speaker-editor__remove {
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

.speaker-editor__remove:hover {
  background: color-mix(in srgb, var(--color-error, #ef4444) 10%, transparent);
  color: var(--color-error, #ef4444);
}

.speaker-editor__add {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.speaker-editor__add:hover {
  opacity: 0.8;
}
</style>
