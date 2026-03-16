<script setup>
const { t } = useI18n()
const { getType, getLabel } = useSubEventTypes()

const props = defineProps({
  suggestion: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['accept', 'dismiss', 'update'])

const typeConfig = computed(() => getType(props.suggestion.type || 'generic'))
const editing = ref(false)
const editTitle = ref(props.suggestion.title)

function onAccept() {
  emit('accept', props.index)
}

function onDismiss() {
  emit('dismiss', props.index)
}

function onSaveEdit() {
  emit('update', props.index, { title: editTitle.value })
  editing.value = false
}

function onStartEdit() {
  editTitle.value = props.suggestion.title
  editing.value = true
}
</script>

<template>
  <div
    class="ai-suggestion-card"
    :class="{ 'ai-suggestion-card--accepted': suggestion.accepted }"
    :style="{
      '--card-color': typeConfig.color,
      '--card-bg': typeConfig.bgColor,
      '--card-border': typeConfig.borderColor,
    }"
  >
    <SubEventTypeIcon :type="suggestion.type || 'generic'" size="sm" />

    <div class="ai-suggestion-card__content">
      <div class="ai-suggestion-card__header">
        <template v-if="editing">
          <input
            v-model="editTitle"
            class="ai-suggestion-card__edit-input"
            @keydown.enter="onSaveEdit"
            @keydown.escape="editing = false"
          />
        </template>
        <template v-else>
          <span class="ai-suggestion-card__title" @dblclick="onStartEdit">{{ suggestion.title }}</span>
        </template>
        <SubEventTypeBadge :type="suggestion.type || 'generic'" />
      </div>
      <p v-if="suggestion.description" class="ai-suggestion-card__description">{{ suggestion.description }}</p>
      <div class="ai-suggestion-card__meta">
        <span v-if="suggestion.durationMinutes" class="ai-suggestion-card__meta-item">
          <Icon name="lucide:clock" size="11" />
          {{ suggestion.durationMinutes }} min
        </span>
      </div>
    </div>

    <div v-if="!suggestion.accepted" class="ai-suggestion-card__actions">
      <button v-if="editing" type="button" class="ai-suggestion-card__action ai-suggestion-card__action--save" @click="onSaveEdit">
        <Icon name="lucide:check" size="14" />
      </button>
      <template v-else>
        <button type="button" class="ai-suggestion-card__action ai-suggestion-card__action--accept" :title="t('editor.coCreate.accept')" @click="onAccept">
          <Icon name="lucide:check" size="14" />
        </button>
        <button type="button" class="ai-suggestion-card__action ai-suggestion-card__action--edit" :title="t('editor.coCreate.edit')" @click="onStartEdit">
          <Icon name="lucide:pencil" size="14" />
        </button>
        <button type="button" class="ai-suggestion-card__action ai-suggestion-card__action--dismiss" :title="t('editor.coCreate.dismiss')" @click="onDismiss">
          <Icon name="lucide:x" size="14" />
        </button>
      </template>
    </div>

    <div v-else class="ai-suggestion-card__accepted-badge">
      <Icon name="lucide:check-circle" size="16" />
    </div>
  </div>
</template>

<style scoped>
.ai-suggestion-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--card-border);
  border-left: 3px solid var(--card-color);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  transition: all var(--transition-base);
}

.ai-suggestion-card--accepted {
  opacity: 0.5;
  border-style: dashed;
}

.ai-suggestion-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-suggestion-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ai-suggestion-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  cursor: text;
}

.ai-suggestion-card__edit-input {
  flex: 1;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  outline: none;
}

.ai-suggestion-card__description {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.ai-suggestion-card__meta {
  display: flex;
  gap: var(--space-3);
}

.ai-suggestion-card__meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 10px;
  color: var(--color-text-muted);
}

.ai-suggestion-card__actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.ai-suggestion-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ai-suggestion-card__action--accept {
  color: var(--color-accent);
}

.ai-suggestion-card__action--accept:hover {
  background: var(--color-accent-dim);
}

.ai-suggestion-card__action--edit {
  color: var(--color-text-muted);
}

.ai-suggestion-card__action--edit:hover {
  background: var(--color-surface);
  color: var(--color-text-secondary);
}

.ai-suggestion-card__action--save {
  color: var(--color-accent);
}

.ai-suggestion-card__action--save:hover {
  background: var(--color-accent-dim);
}

.ai-suggestion-card__action--dismiss {
  color: var(--color-text-muted);
}

.ai-suggestion-card__action--dismiss:hover {
  background: color-mix(in srgb, var(--color-error, #ef4444) 10%, transparent);
  color: var(--color-error, #ef4444);
}

.ai-suggestion-card__accepted-badge {
  color: var(--color-accent);
  flex-shrink: 0;
  opacity: 0.6;
}
</style>
