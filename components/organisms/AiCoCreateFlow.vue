<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: [Number, String],
    required: true,
  },
  eventType: {
    type: String,
    default: null,
  },
  eventTitle: {
    type: String,
    default: '',
  },
  hasAi: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  existingSubEvents: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['sub-events-created', 'add-manually'])

const {
  prompt,
  loading,
  error,
  suggestions,
  hasGenerated,
  pendingSuggestions,
  acceptedSuggestions,
  generate,
  acceptSuggestion,
  dismissSuggestion,
  updateSuggestion,
  acceptAll,
  reset,
} = useAiCoCreate()

const isCompact = computed(() => props.existingSubEvents.length > 0)
const showPrompt = ref(!isCompact.value)

async function onGenerate() {
  await generate({
    eventType: props.eventType,
    eventTitle: props.eventTitle,
    existingSubEvents: props.existingSubEvents.map((se) => ({ title: se.title })),
    eventId: String(props.eventId),
  })
}

async function onAcceptAll() {
  acceptAll()
  await createAcceptedSubEvents()
}

async function onAccept(index) {
  acceptSuggestion(index)
  // Create the single accepted sub-event immediately
  const suggestion = suggestions.value[index]
  if (suggestion) {
    await $fetch(`/api/events/${props.eventId}/sub-events`, {
      method: 'POST',
      body: {
        title: suggestion.title,
        type: suggestion.type || 'generic',
        description: suggestion.description || null,
        typeConfig: suggestion.typeConfig || {},
      },
    })
    emit('sub-events-created')
  }
}

async function createAcceptedSubEvents() {
  const toCreate = acceptedSuggestions.value
  for (const suggestion of toCreate) {
    await $fetch(`/api/events/${props.eventId}/sub-events`, {
      method: 'POST',
      body: {
        title: suggestion.title,
        type: suggestion.type || 'generic',
        description: suggestion.description || null,
        typeConfig: suggestion.typeConfig || {},
      },
    })
  }
  emit('sub-events-created')
  reset()
  showPrompt.value = false
}

function onRegenerate() {
  suggestions.value = []
  hasGenerated.value = false
}
</script>

<template>
  <div class="co-create">
    <!-- Compact mode: pill button to expand -->
    <template v-if="isCompact && !showPrompt">
      <button
        v-if="hasAi && canEdit"
        type="button"
        class="co-create__pill"
        @click="showPrompt = true"
      >
        <Icon name="lucide:sparkles" size="14" />
        {{ t('editor.coCreate.addMore') }}
      </button>
    </template>

    <!-- Full co-creation flow -->
    <template v-else-if="hasAi && canEdit">
      <!-- Empty state / prompt -->
      <div v-if="!hasGenerated" class="co-create__prompt-section">
        <AiCoCreatePrompt
          v-model="prompt"
          :loading="loading"
          :compact="isCompact"
          @generate="onGenerate"
        />
        <div class="co-create__alt-actions">
          <button type="button" class="co-create__text-link" @click="emit('add-manually')">
            {{ t('editor.coCreate.addManually') }}
          </button>
          <button v-if="isCompact" type="button" class="co-create__text-link" @click="showPrompt = false">
            {{ t('dashboard.cancel') }}
          </button>
        </div>
        <div v-if="error" class="co-create__error">
          <Icon name="lucide:alert-circle" size="12" />
          {{ error }}
        </div>
      </div>

      <!-- Loading skeletons -->
      <div v-else-if="loading" class="co-create__skeletons">
        <div v-for="i in 3" :key="i" class="co-create__skeleton">
          <div class="co-create__skeleton-icon" />
          <div class="co-create__skeleton-content">
            <div class="co-create__skeleton-title" />
            <div class="co-create__skeleton-desc" />
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-else class="co-create__results">
        <TransitionGroup name="suggestion-list" tag="div" class="co-create__suggestions">
          <AiSubEventSuggestionCard
            v-for="(suggestion, index) in suggestions"
            :key="suggestion.title + index"
            :suggestion="suggestion"
            :index="index"
            @accept="onAccept"
            @dismiss="dismissSuggestion"
            @update="updateSuggestion"
          />
        </TransitionGroup>

        <div v-if="pendingSuggestions.length > 0" class="co-create__bulk-actions">
          <AppButton variant="primary" size="sm" @click="onAcceptAll">
            <Icon name="lucide:check-check" size="14" />
            {{ t('editor.coCreate.acceptAll') }}
          </AppButton>
          <button type="button" class="co-create__text-link" @click="onRegenerate">
            <Icon name="lucide:refresh-cw" size="12" />
            {{ t('editor.coCreate.regenerate') }}
          </button>
        </div>

        <div v-if="pendingSuggestions.length === 0" class="co-create__done">
          <Icon name="lucide:check-circle" size="16" class="co-create__done-icon" />
          <span>{{ t('editor.coCreate.allAccepted') }}</span>
          <button type="button" class="co-create__text-link" @click="reset">
            {{ t('editor.coCreate.generateMore') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Free tier: just show add manually -->
    <template v-else-if="canEdit && !hasAi">
      <div v-if="!isCompact" class="co-create__free">
        <div class="co-create__free-hint">
          <AppText size="xs" muted>{{ t('editor.coCreate.upgradeHint') }}</AppText>
          <TierBadge tier="standard" />
        </div>
        <button type="button" class="co-create__text-link" @click="emit('add-manually')">
          {{ t('editor.coCreate.addManually') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.co-create {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.co-create__pill {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: var(--radius-full);
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.co-create__pill:hover {
  background: var(--color-accent-bg);
  box-shadow: var(--shadow-accent-sm);
}

.co-create__prompt-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.co-create__alt-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.co-create__text-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.co-create__text-link:hover {
  opacity: 1;
  color: var(--color-accent);
}

.co-create__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-error, #ef4444) 8%, transparent);
  color: var(--color-error, #ef4444);
  font-size: var(--text-xs);
}

/* Skeletons */
.co-create__skeletons {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.co-create__skeleton {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.co-create__skeleton-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: var(--color-border-light);
  animation: pulse 1.5s ease-in-out infinite;
}

.co-create__skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.co-create__skeleton-title {
  width: 60%;
  height: 14px;
  border-radius: var(--radius-sm);
  background: var(--color-border-light);
  animation: pulse 1.5s ease-in-out infinite;
}

.co-create__skeleton-desc {
  width: 85%;
  height: 10px;
  border-radius: var(--radius-sm);
  background: var(--color-border-light);
  animation: pulse 1.5s ease-in-out infinite;
  animation-delay: 0.2s;
}

/* Results */
.co-create__results {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.co-create__suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.co-create__bulk-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.co-create__done {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.co-create__done-icon {
  color: var(--color-accent);
}

.co-create__free {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  text-align: center;
}

.co-create__free-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Transitions */
.suggestion-list-enter-active {
  transition: all 300ms ease-out;
}

.suggestion-list-leave-active {
  transition: all 200ms ease-in;
}

.suggestion-list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.suggestion-list-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
</style>
