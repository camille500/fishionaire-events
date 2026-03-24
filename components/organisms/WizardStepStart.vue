<script setup>
const { t, locale } = useI18n()
const { form, startMode, populateFromAi } = useWizardState()

const props = defineProps({
  wizardAi: { type: Object, required: true },
})

const emit = defineEmits(['manual', 'aiComplete'])

const userInput = ref('')
const chatArea = ref(null)
const hasStarted = ref(false)

// Accept prompt from dashboard via query param
const route = useRoute()
onMounted(async () => {
  if (route.query.prompt) {
    const promptText = String(route.query.prompt)
    hasStarted.value = true
    await nextTick()
    await sendMessage(promptText)
  }
})

async function sendMessage(text) {
  const message = text || userInput.value.trim()
  if (!message) return
  if (props.wizardAi.chatComplete.value) return

  const previousInput = userInput.value
  userInput.value = ''
  hasStarted.value = true

  const result = await props.wizardAi.sendChatMessage(message)
  if (result === null && props.wizardAi.chatMessages.value.length === 0) {
    userInput.value = previousInput
  }
  await nextTick()
  scrollToBottom()
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function scrollToBottom() {
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight
  }
}

function acceptResult() {
  if (!props.wizardAi.buildResult.value) return
  populateFromAi(props.wizardAi.buildResult.value)
  startMode.value = 'ai'
  emit('aiComplete')
}

function startManual() {
  startMode.value = 'manual'
  emit('manual')
}

// Static greeting message
const greeting = computed(() => {
  return locale.value === 'nl'
    ? 'Hoi! Vertel me over het evenement dat je wilt plannen.'
    : 'Hi! Tell me about the event you\'d like to plan.'
})

const inputPlaceholder = computed(() => {
  return locale.value === 'nl'
    ? 'Typ je bericht...'
    : 'Type your message...'
})

const suggestions = computed(() => {
  if (locale.value === 'nl') {
    return [
      'Verjaardagsfeest voor 20 personen',
      'Bedrijfsborrel met quiz',
      'Intiem diner thuis',
    ]
  }
  return [
    'Birthday party for 20 people',
    'Corporate drinks with a quiz',
    'Intimate dinner at home',
  ]
})

// Watch for new messages to auto-scroll
watch(() => props.wizardAi.chatMessages.value.length, async () => {
  await nextTick()
  scrollToBottom()
})
</script>

<template>
  <div class="step-start">
    <div class="step-start__header">
      <AppHeading :level="2" size="xl">{{ t('wizard.start.title') }}</AppHeading>
      <AppText size="sm" muted>{{ t('wizard.start.subtitle') }}</AppText>
    </div>

    <!-- Chat area -->
    <div class="step-start__chat-wrap">
      <div ref="chatArea" class="step-start__chat">
        <!-- Static greeting -->
        <ChatBubble
          role="assistant"
          :content="greeting"
        />

        <!-- Suggestion chips -->
        <div v-if="!hasStarted" class="step-start__suggestions">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            class="step-start__chip"
            @click="sendMessage(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>

        <!-- Conversation messages -->
        <ChatBubble
          v-for="(msg, i) in wizardAi.chatMessages.value"
          :key="i"
          :role="msg.role"
          :content="msg.content"
          :is-result="msg.isResult || false"
          :is-error="msg.isError || false"
          :event="msg.isResult ? wizardAi.buildResult.value : null"
        />

        <!-- Typing indicator -->
        <ChatTypingIndicator v-if="wizardAi.chatLoading.value" />
      </div>

      <!-- Accept result actions -->
      <div v-if="wizardAi.chatComplete.value" class="step-start__result-actions">
        <AppButton
          variant="gradient"
          size="sm"
          @click="acceptResult"
        >
          <Icon name="lucide:check" size="14" />
          {{ locale === 'nl' ? 'Ziet er goed uit!' : 'Looks good!' }}
        </AppButton>
        <button
          v-if="!wizardAi.chatLimitReached.value"
          type="button"
          class="step-start__refine-link"
          @click="wizardAi.continueChat()"
        >
          <Icon name="lucide:pencil" size="12" />
          {{ locale === 'nl' ? 'Verfijnen' : 'Refine' }}
        </button>
        <button
          type="button"
          class="step-start__edit-link"
          @click="startManual"
        >
          {{ locale === 'nl' ? 'Ik pas het zelf aan' : 'I\'ll adjust it myself' }}
        </button>
      </div>

      <!-- Input area -->
      <div v-if="!wizardAi.chatComplete.value" class="step-start__input-area">
        <div class="step-start__input-wrap">
          <textarea
            v-model="userInput"
            class="step-start__textarea"
            :placeholder="inputPlaceholder"
            rows="1"
            :disabled="wizardAi.chatLoading.value"
            autofocus
            @keydown="onKeydown"
          />
          <button
            type="button"
            class="step-start__send-btn"
            :disabled="!userInput.trim() || wizardAi.chatLoading.value"
            @click="sendMessage()"
          >
            <Icon name="lucide:send" size="16" />
          </button>
        </div>
        <div class="step-start__input-meta">
          <span v-if="wizardAi.isFree.value && hasStarted" class="step-start__turns">
            {{ wizardAi.chatTurnsRemaining.value }}/{{ wizardAi.chatTurnLimit.value }}
            {{ locale === 'nl' ? 'berichten over' : 'messages left' }}
          </span>
          <span v-else class="step-start__hint">
            Enter
          </span>
        </div>
      </div>

      <!-- Free tier exhausted -->
      <div v-if="wizardAi.freeBuildExhausted.value && !hasStarted" class="step-start__upsell">
        <Icon name="lucide:sparkles" size="14" />
        <span>{{ t('wizard.start.ai.upsell') }}</span>
      </div>
    </div>

    <!-- Manual fallback -->
    <div class="step-start__manual">
      <button
        type="button"
        class="step-start__manual-link"
        @click="startManual"
      >
        {{ t('wizard.start.manual.fallback') }}
        <Icon name="lucide:arrow-right" size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-start {
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.step-start__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Chat area */
.step-start__chat-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  padding: var(--space-4);
}

.step-start__chat {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-height: 360px;
  overflow-y: auto;
  padding-right: var(--space-1);
  scroll-behavior: smooth;
}

.step-start__chat::-webkit-scrollbar {
  width: 4px;
}

.step-start__chat::-webkit-scrollbar-thumb {
  background: var(--color-border-light);
  border-radius: 2px;
}

/* Suggestion chips */
.step-start__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  animation: fade-in 400ms ease-out;
}

.step-start__chip {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, var(--color-border-light));
  border-radius: var(--radius-full);
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.step-start__chip:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-accent);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Result actions */
.step-start__result-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  justify-content: center;
  padding-top: var(--space-2);
}

.step-start__refine-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border: 1px solid var(--color-border-light);
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-accent);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.step-start__refine-link:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.step-start__edit-link {
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  text-decoration: underline;
  transition: color var(--transition-fast);
}

.step-start__edit-link:hover {
  color: var(--color-text-primary);
}

/* Input area */
.step-start__input-area {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.step-start__input-wrap {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  background: var(--input-bg);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-1) var(--space-1) var(--space-4);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.step-start__input-wrap:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.step-start__textarea {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
  resize: none;
  line-height: var(--line-height-normal);
  min-height: 20px;
  max-height: 80px;
}

.step-start__textarea::placeholder {
  color: var(--color-text-muted);
}

.step-start__send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.step-start__send-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: scale(1.05);
}

.step-start__send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.step-start__input-meta {
  display: flex;
  justify-content: flex-end;
  padding-right: var(--space-1);
}

.step-start__turns {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.step-start__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  opacity: 0.5;
}

/* Upsell */
.step-start__upsell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-size: var(--text-sm);
}

/* Manual fallback */
.step-start__manual {
  display: flex;
  justify-content: center;
}

.step-start__manual-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.step-start__manual-link:hover {
  color: var(--color-text-primary);
}
</style>
