<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  token: { type: String, required: true },
})

const emit = defineEmits(['close', 'claim'])

const { t } = useI18n()
const messageInput = ref('')
const chatContainer = ref(null)

// Amount picker state
const isJoining = ref(false)
const isUpdating = ref(false)
const customAmount = ref('')
const selectedPreset = ref(null)
const amountError = ref('')

const {
  messages,
  contributors,
  loading,
  sending,
  startPolling,
  stopPolling,
  sendMessage,
} = useWishlistChat(props.token)

onMounted(() => {
  startPolling(props.item.id)
})

onUnmounted(() => {
  stopPolling()
})

watch(messages, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}, { deep: true })

// --- Formatting ---

function formatPrice(cents) {
  if (!cents && cents !== 0) return '-'
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

// --- Pool computeds ---

const segmentColors = ['#00b894', '#6c5ce7', '#fd79a8', '#fdcb6e', '#e17055', '#74b9ff']

const remainingCents = computed(() => {
  if (!props.item.poolTargetCents) return 0
  return Math.max(0, props.item.poolTargetCents - (props.item.pooledCents || 0))
})

const poolProgress = computed(() => {
  if (!props.item.isPoolable || !props.item.poolTargetCents) return 0
  return Math.min(100, Math.round(((props.item.pooledCents || 0) / props.item.poolTargetCents) * 100))
})

const isAlmostFunded = computed(() => poolProgress.value >= 80 && poolProgress.value < 100)

const sortedContributors = computed(() => {
  const list = [...contributors.value]
  // Me first, then by amount descending
  list.sort((a, b) => {
    if (a.isMe && !b.isMe) return -1
    if (!a.isMe && b.isMe) return 1
    return (b.amountCents || 0) - (a.amountCents || 0)
  })
  return list
})

const myContributor = computed(() => contributors.value.find((c) => c.isMe))

// --- Split presets ---

const equalSplitCents = computed(() => {
  const people = contributors.value.length + (myContributor.value ? 0 : 1)
  if (people <= 0 || remainingCents.value <= 0) return remainingCents.value
  return Math.ceil(remainingCents.value / people)
})

const presets = computed(() => {
  const remaining = remainingCents.value
  if (remaining <= 0) return []
  const half = Math.ceil(remaining / 2)
  return [
    { key: 'equal', label: t('wishlist.chat.splitEqual'), cents: equalSplitCents.value },
    { key: 'half', label: t('wishlist.chat.splitHalf'), cents: half },
    { key: 'rest', label: t('wishlist.chat.splitRest'), cents: remaining },
  ].filter((p) => p.cents > 0)
})

// --- Amount picker actions ---

function startJoining() {
  isJoining.value = true
  isUpdating.value = false
  selectedPreset.value = 'equal'
  customAmount.value = ''
  amountError.value = ''
}

function startUpdating() {
  isUpdating.value = true
  isJoining.value = true
  selectedPreset.value = null
  customAmount.value = myContributor.value?.amountCents
    ? (myContributor.value.amountCents / 100).toFixed(2).replace('.00', '')
    : ''
  amountError.value = ''
}

function cancelJoining() {
  isJoining.value = false
  isUpdating.value = false
  selectedPreset.value = null
  customAmount.value = ''
  amountError.value = ''
}

function selectPreset(key) {
  selectedPreset.value = key
  customAmount.value = ''
  amountError.value = ''
}

function onCustomInput() {
  selectedPreset.value = null
  amountError.value = ''
}

function getSelectedCents() {
  if (selectedPreset.value) {
    const preset = presets.value.find((p) => p.key === selectedPreset.value)
    return preset?.cents || 0
  }
  const val = parseFloat(customAmount.value)
  if (isNaN(val)) return 0
  return Math.round(val * 100)
}

function confirmAmount() {
  const cents = getSelectedCents()
  if (!cents || cents <= 0) {
    amountError.value = t('wishlist.chat.amountRequired')
    return
  }
  // For updates, allow up to remaining + current contribution
  const maxCents = isUpdating.value
    ? remainingCents.value + (myContributor.value?.amountCents || 0)
    : remainingCents.value
  if (cents > maxCents) {
    amountError.value = t('wishlist.chat.amountExceeds')
    return
  }
  emit('claim', props.item.id, cents)
  cancelJoining()
}

function quickCoverRest() {
  emit('claim', props.item.id, remainingCents.value)
}

// --- Chat ---

async function handleSend() {
  const content = messageInput.value.trim()
  if (!content) return
  messageInput.value = ''
  await sendMessage(props.item.id, content)
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function getContributorColor(index) {
  return segmentColors[index % segmentColors.length]
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel-fade">
      <div class="chat-overlay" @click.self="emit('close')">
        <div class="chat-panel">
          <!-- Header -->
          <div class="chat-panel__header">
            <div class="chat-panel__header-info">
              <h3 class="chat-panel__title">{{ item.title }}</h3>
              <span v-if="item.priceCents" class="chat-panel__price">{{ formatPrice(item.priceCents) }}</span>
            </div>
            <button class="chat-panel__close" @click="emit('close')">
              <Icon name="lucide:x" />
            </button>
          </div>

          <!-- Segmented pool progress -->
          <div v-if="item.isPoolable && item.poolTargetCents" class="chat-panel__pool">
            <div class="chat-panel__pool-bar">
              <div
                v-for="(contrib, i) in sortedContributors"
                :key="i"
                class="chat-panel__segment"
                :style="{
                  width: (contrib.amountCents || 0) / item.poolTargetCents * 100 + '%',
                  background: getContributorColor(i),
                }"
                :title="(contrib.isMe ? t('wishlist.chat.you') : contrib.guestName) + ' ' + formatPrice(contrib.amountCents)"
              />
            </div>
            <div class="chat-panel__pool-labels">
              <span>{{ t('wishlist.chat.ofTarget', { current: formatPrice(item.pooledCents || 0), target: formatPrice(item.poolTargetCents) }) }}</span>
              <span v-if="remainingCents > 0" class="chat-panel__remaining">
                {{ t('wishlist.chat.remaining', { amount: formatPrice(remainingCents) }) }}
              </span>
            </div>
          </div>

          <!-- Smart nudge -->
          <div v-if="item.isPoolable && item.poolTargetCents && !isJoining" class="chat-panel__nudge-area">
            <!-- Almost funded nudge -->
            <div v-if="isAlmostFunded && !myContributor" class="chat-panel__nudge chat-panel__nudge--accent">
              <span>{{ t('wishlist.chat.almostThere', { amount: formatPrice(remainingCents) }) }}</span>
              <button class="chat-panel__nudge-action" @click="quickCoverRest">
                {{ t('wishlist.chat.coverTheRest') }}
              </button>
            </div>
            <!-- No contributors yet -->
            <div v-else-if="contributors.length === 0 && !myContributor" class="chat-panel__nudge">
              <span>{{ t('wishlist.chat.beFirst') }}</span>
              <span class="chat-panel__nudge-hint">{{ t('wishlist.chat.suggestedSplit', { amount: formatPrice(equalSplitCents) }) }}</span>
            </div>
            <!-- My contribution display -->
            <div v-else-if="myContributor" class="chat-panel__nudge chat-panel__nudge--mine">
              <span>{{ t('wishlist.chat.yourContribution', { amount: formatPrice(myContributor.amountCents) }) }}</span>
              <button v-if="remainingCents > 0" class="chat-panel__nudge-action" @click="startUpdating">
                {{ t('wishlist.chat.adjustAmount') }}
              </button>
            </div>
          </div>

          <!-- Contributors -->
          <div v-if="sortedContributors.length > 0" class="chat-panel__contributors">
            <h4 class="chat-panel__section-title">
              <Icon name="lucide:users" />
              {{ t('wishlist.chat.contributors') }}
            </h4>
            <div class="chat-panel__contributor-list">
              <button
                v-for="(contrib, i) in sortedContributors"
                :key="i"
                class="chat-panel__contributor"
                :class="{
                  'chat-panel__contributor--me': contrib.isMe,
                  'chat-panel__contributor--editable': contrib.isMe && remainingCents > 0,
                }"
                @click="contrib.isMe && remainingCents > 0 ? startUpdating() : null"
              >
                <span
                  class="chat-panel__contributor-dot"
                  :style="{ background: getContributorColor(i) }"
                />
                <span class="chat-panel__contributor-name">
                  {{ contrib.isMe ? t('wishlist.chat.you') : (contrib.guestName || '?') }}
                </span>
                <span v-if="contrib.amountCents" class="chat-panel__contributor-amount">
                  {{ formatPrice(contrib.amountCents) }}
                </span>
                <Icon v-if="contrib.isMe && remainingCents > 0" name="lucide:pencil" class="chat-panel__contributor-edit" />
              </button>
            </div>
          </div>

          <!-- Chat messages -->
          <div ref="chatContainer" class="chat-panel__messages">
            <div v-if="loading && messages.length === 0" class="chat-panel__loading">
              <Icon name="lucide:loader-2" class="chat-panel__spinner" />
            </div>
            <div v-else-if="messages.length === 0" class="chat-panel__empty">
              <Icon name="lucide:message-circle" />
              <p>{{ t('wishlist.chat.empty') }}</p>
            </div>
            <WishlistChatBubble
              v-for="msg in messages"
              :key="msg.id"
              :guest-name="msg.guestName"
              :content="msg.content"
              :created-at="msg.createdAt"
              :is-me="msg.isMe"
            />
          </div>

          <!-- Amount picker (join or update) -->
          <div v-if="isJoining && item.isPoolable" class="chat-panel__amount-picker">
            <div class="chat-panel__presets">
              <button
                v-for="preset in presets"
                :key="preset.key"
                class="chat-panel__preset"
                :class="{ 'chat-panel__preset--active': selectedPreset === preset.key }"
                @click="selectPreset(preset.key)"
              >
                <span class="chat-panel__preset-label">{{ preset.label }}</span>
                <span class="chat-panel__preset-amount">{{ formatPrice(preset.cents) }}</span>
              </button>
            </div>

            <div class="chat-panel__custom">
              <label class="chat-panel__custom-label">{{ t('wishlist.chat.enterAmount') }}</label>
              <div class="chat-panel__custom-input-wrap">
                <span class="chat-panel__custom-prefix">&euro;</span>
                <input
                  v-model="customAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  :placeholder="(equalSplitCents / 100).toFixed(2)"
                  class="chat-panel__custom-input"
                  @input="onCustomInput"
                />
              </div>
            </div>

            <p v-if="amountError" class="chat-panel__amount-error">{{ amountError }}</p>

            <div class="chat-panel__amount-actions">
              <AppButton variant="primary" size="sm" @click="confirmAmount">
                {{ isUpdating ? t('wishlist.chat.update') : t('wishlist.chat.confirm') }}
              </AppButton>
              <button class="chat-panel__amount-cancel" @click="cancelJoining">
                {{ t('wishlist.chat.cancel') }}
              </button>
            </div>
          </div>

          <!-- Join CTA (only when not already picking amount and not a contributor) -->
          <div v-else-if="!myContributor && item.isPoolable && remainingCents > 0" class="chat-panel__join">
            <AppButton variant="primary" size="sm" @click="startJoining">
              <Icon name="lucide:hand-heart" />
              {{ t('wishlist.chat.joinIn') }}
            </AppButton>
          </div>

          <!-- Input -->
          <div class="chat-panel__input">
            <textarea
              v-model="messageInput"
              :placeholder="t('wishlist.chat.placeholder')"
              class="chat-panel__textarea"
              rows="1"
              maxlength="500"
              @keydown="handleKeydown"
            />
            <button
              class="chat-panel__send"
              :disabled="!messageInput.trim() || sending"
              @click="handleSend"
            >
              <Icon name="lucide:send" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.chat-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.chat-panel {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.chat-panel__header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.chat-panel__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-panel__price {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.chat-panel__close {
  background: none;
  border: none;
  padding: var(--space-2);
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.chat-panel__close:hover {
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  color: var(--color-text-primary);
}

/* Segmented pool progress */
.chat-panel__pool {
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border-light);
}

.chat-panel__pool-bar {
  height: 8px;
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
  display: flex;
}

.chat-panel__segment {
  height: 100%;
  transition: width 400ms ease;
  min-width: 2px;
}

.chat-panel__segment:first-child {
  border-radius: var(--radius-full) 0 0 var(--radius-full);
}

.chat-panel__segment:last-child {
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

.chat-panel__segment:only-child {
  border-radius: var(--radius-full);
}

.chat-panel__pool-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.chat-panel__remaining {
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

/* Smart nudges */
.chat-panel__nudge-area {
  padding: var(--space-2) var(--space-4);
}

.chat-panel__nudge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.chat-panel__nudge--accent {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
}

.chat-panel__nudge--mine {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-primary);
}

.chat-panel__nudge-hint {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.chat-panel__nudge-action {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.chat-panel__nudge-action:hover {
  opacity: 0.8;
}

/* Contributors */
.chat-panel__contributors {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.chat-panel__section-title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.chat-panel__contributor-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chat-panel__contributor {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  cursor: default;
}

.chat-panel__contributor--me {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-accent) 25%, transparent);
  color: var(--color-accent);
}

.chat-panel__contributor--editable {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chat-panel__contributor--editable:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
}

.chat-panel__contributor-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chat-panel__contributor-name {
  font-weight: var(--font-weight-medium);
}

.chat-panel__contributor-amount {
  color: var(--color-text-muted);
}

.chat-panel__contributor--me .chat-panel__contributor-amount {
  color: var(--color-accent);
  opacity: 0.7;
}

.chat-panel__contributor-edit {
  font-size: 10px;
  opacity: 0.5;
  margin-left: 2px;
}

/* Messages */
.chat-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 160px;
}

.chat-panel__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--color-text-muted);
}

.chat-panel__spinner {
  animation: spin 1s linear infinite;
}

.chat-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.chat-panel__empty p {
  margin: 0;
}

/* Amount picker */
.chat-panel__amount-picker {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-background));
  animation: slide-up 200ms ease-out;
}

.chat-panel__presets {
  display: flex;
  gap: var(--space-2);
}

.chat-panel__preset {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-2) var(--space-1);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chat-panel__preset:hover {
  border-color: var(--color-accent);
}

.chat-panel__preset--active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.chat-panel__preset-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.chat-panel__preset--active .chat-panel__preset-label {
  color: var(--color-accent);
}

.chat-panel__preset-amount {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.chat-panel__preset--active .chat-panel__preset-amount {
  color: var(--color-accent);
}

.chat-panel__custom {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.chat-panel__custom-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.chat-panel__custom-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.chat-panel__custom-input-wrap:focus-within {
  border-color: var(--color-accent);
}

.chat-panel__custom-prefix {
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-semibold);
}

.chat-panel__custom-input {
  flex: 1;
  border: none;
  outline: none;
  padding: var(--space-2) var(--space-3) var(--space-2) 0;
  font-size: var(--text-sm);
  font-family: var(--font-family);
  background: transparent;
  color: var(--color-text-primary);
  min-width: 0;
}

.chat-panel__custom-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.5;
}

/* Remove number input spinners */
.chat-panel__custom-input::-webkit-outer-spin-button,
.chat-panel__custom-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.chat-panel__custom-input[type='number'] {
  -moz-appearance: textfield;
}

.chat-panel__amount-error {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin: 0;
}

.chat-panel__amount-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.chat-panel__amount-cancel {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.chat-panel__amount-cancel:hover {
  color: var(--color-text-primary);
}

/* Join CTA */
.chat-panel__join {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: center;
}

/* Input */
.chat-panel__input {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
}

.chat-panel__textarea {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  resize: none;
  background: var(--color-surface);
  color: var(--color-text-primary);
  max-height: 100px;
  overflow-y: auto;
}

.chat-panel__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.chat-panel__send {
  background: var(--color-accent);
  color: white;
  border: none;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-panel__send:hover:not(:disabled) {
  filter: brightness(0.9);
}

.chat-panel__send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Transitions */
.panel-fade-enter-active {
  transition: opacity 200ms ease;
}

.panel-fade-enter-active .chat-panel {
  transition: transform 200ms ease, opacity 200ms ease;
}

.panel-fade-leave-active {
  transition: opacity 150ms ease;
}

.panel-fade-leave-active .chat-panel {
  transition: transform 150ms ease, opacity 150ms ease;
}

.panel-fade-enter-from {
  opacity: 0;
}

.panel-fade-enter-from .chat-panel {
  transform: translateY(20px);
  opacity: 0;
}

.panel-fade-leave-to {
  opacity: 0;
}

.panel-fade-leave-to .chat-panel {
  transform: translateY(20px);
  opacity: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile: full-screen */
@media (max-width: 640px) {
  .chat-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .chat-panel {
    max-width: 100%;
    max-height: 100vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    height: 90vh;
  }

  .chat-panel__presets {
    gap: var(--space-1);
  }

  .chat-panel__preset {
    padding: var(--space-2) var(--space-1);
  }
}
</style>
