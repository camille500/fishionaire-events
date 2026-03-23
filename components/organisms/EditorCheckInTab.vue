<script setup>
const { t } = useI18n()

const props = defineProps({
  eventId: {
    type: [Number, String],
    required: true,
  },
  features: {
    type: Object,
    default: () => ({}),
  },
})

const {
  stats, recentCheckIns, loading, lastScanResult, percentage,
  fetchStats, fetchCheckedInGuests, checkInByToken, undoCheckIn, extractTokenFromUrl,
} = useCheckIn(props.eventId)

const scanning = ref(false)
const scanner = ref(null)
const scannerElementId = 'check-in-scanner'
const processingToken = ref(false)
const toast = useToast()

onMounted(async () => {
  await Promise.all([fetchStats(), fetchCheckedInGuests()])
})

async function startScanner() {
  try {
    const { Html5Qrcode } = await import('html5-qrcode')
    scanner.value = new Html5Qrcode(scannerElementId)
    await scanner.value.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
    )
    scanning.value = true
  } catch {
    toast.add({ title: t('checkIn.scanner.cameraError'), color: 'red' })
  }
}

async function stopScanner() {
  if (scanner.value) {
    try {
      await scanner.value.stop()
    } catch {
      // Scanner might already be stopped
    }
  }
  scanning.value = false
}

async function onScanSuccess(decodedText) {
  if (processingToken.value) return
  processingToken.value = true

  const token = extractTokenFromUrl(decodedText)
  if (!token) {
    lastScanResult.value = { success: false, error: t('checkIn.result.invalidQr') }
    processingToken.value = false
    return
  }

  try {
    const guest = await checkInByToken(token)
    const name = guest.inviteeName || guest.inviteeEmail
    toast.add({ title: t('checkIn.result.success', { name }), color: 'green' })
  } catch (err) {
    const message = err?.data?.statusMessage || t('checkIn.result.invalidQr')
    toast.add({ title: message, color: 'red' })
  }

  // Brief cooldown so the same QR isn't scanned repeatedly
  setTimeout(() => {
    processingToken.value = false
  }, 2000)
}

async function handleUndo(invitationId) {
  try {
    await undoCheckIn(invitationId)
    toast.add({ title: t('checkIn.guests.undone'), color: 'green' })
  } catch {
    toast.add({ title: t('checkIn.result.error'), color: 'red' })
  }
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onUnmounted(() => {
  if (scanner.value) {
    scanner.value.stop().catch(() => {})
  }
})
</script>

<template>
  <div class="check-in-tab">
    <!-- Stats -->
    <div class="check-in-tab__stats">
      <div class="check-in-tab__stat check-in-tab__stat--primary">
        <span class="check-in-tab__stat-value">{{ stats.checkedIn }}</span>
        <span class="check-in-tab__stat-label">{{ t('checkIn.stats.checkedInLabel') }}</span>
      </div>
      <div class="check-in-tab__stat">
        <span class="check-in-tab__stat-value">{{ stats.total }}</span>
        <span class="check-in-tab__stat-label">{{ t('checkIn.stats.expectedLabel') }}</span>
      </div>
      <div class="check-in-tab__stat">
        <span class="check-in-tab__stat-value">{{ percentage }}%</span>
        <span class="check-in-tab__stat-label">{{ t('checkIn.stats.arrivedLabel') }}</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="check-in-tab__progress">
      <div class="check-in-tab__progress-bar">
        <div
          class="check-in-tab__progress-fill"
          :style="{ width: percentage + '%' }"
        />
      </div>
      <span class="check-in-tab__progress-text">
        {{ t('checkIn.stats.checkedIn', { count: stats.checkedIn, total: stats.total }) }}
      </span>
    </div>

    <!-- Scanner section -->
    <div class="check-in-tab__scanner-section">
      <div class="check-in-tab__scanner-header">
        <AppHeading :level="3">{{ t('checkIn.scanner.title') }}</AppHeading>
        <AppButton
          :variant="scanning ? 'secondary' : 'primary'"
          size="sm"
          @click="scanning ? stopScanner() : startScanner()"
        >
          <Icon :name="scanning ? 'lucide:camera-off' : 'lucide:scan-line'" size="16" />
          {{ scanning ? t('checkIn.scanner.stop') : t('checkIn.scanner.start') }}
        </AppButton>
      </div>

      <div
        :id="scannerElementId"
        class="check-in-tab__scanner-viewport"
        :class="{ 'check-in-tab__scanner-viewport--active': scanning }"
      />

      <AppText v-if="scanning" size="sm" muted class="check-in-tab__scanner-hint">
        {{ t('checkIn.scanner.scanning') }}
      </AppText>
    </div>

    <!-- Last scan result -->
    <Transition name="result">
      <div
        v-if="lastScanResult"
        class="check-in-tab__result"
        :class="lastScanResult.success ? 'check-in-tab__result--success' : 'check-in-tab__result--error'"
      >
        <Icon
          :name="lastScanResult.success ? 'lucide:check-circle-2' : 'lucide:alert-circle'"
          size="20"
        />
        <span v-if="lastScanResult.success">
          {{ t('checkIn.result.success', { name: lastScanResult.guest?.inviteeName || lastScanResult.guest?.inviteeEmail }) }}
        </span>
        <span v-else>{{ lastScanResult.error }}</span>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="check-in-tab__loading">
      <Icon name="lucide:loader-2" size="24" class="check-in-tab__spinner" />
    </div>

    <!-- Recent arrivals -->
    <div v-else-if="recentCheckIns.length > 0" class="check-in-tab__arrivals">
      <AppHeading :level="3">{{ t('checkIn.guests.title') }}</AppHeading>
      <div class="check-in-tab__guest-list">
        <div
          v-for="guest in recentCheckIns"
          :key="guest.id"
          class="check-in-tab__guest-row"
        >
          <div class="check-in-tab__guest-info">
            <Icon name="lucide:check-circle-2" size="16" class="check-in-tab__guest-icon" />
            <div class="check-in-tab__guest-details">
              <span class="check-in-tab__guest-name">
                {{ guest.inviteeName || guest.inviteeEmail }}
              </span>
              <span class="check-in-tab__guest-time">
                {{ formatTime(guest.checkedInAt) }}
              </span>
            </div>
          </div>
          <button
            class="check-in-tab__undo-btn"
            @click="handleUndo(guest.id)"
          >
            {{ t('checkIn.guests.undo') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="check-in-tab__empty">
      <Icon name="lucide:scan-line" size="32" class="check-in-tab__empty-icon" />
      <AppHeading :level="3">{{ t('checkIn.title') }}</AppHeading>
      <AppText size="sm" muted>{{ t('checkIn.subtitle') }}</AppText>
    </div>
  </div>
</template>

<style scoped>
.check-in-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.check-in-tab__stats {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.check-in-tab__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.check-in-tab__stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.check-in-tab__stat--primary .check-in-tab__stat-value {
  color: var(--color-success, #27ae60);
}

.check-in-tab__stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Progress bar */
.check-in-tab__progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.check-in-tab__progress-bar {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border-light);
  overflow: hidden;
}

.check-in-tab__progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--color-success, #27ae60);
  transition: width 0.4s ease;
}

.check-in-tab__progress-text {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Scanner */
.check-in-tab__scanner-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.check-in-tab__scanner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.check-in-tab__scanner-viewport {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  min-height: 0;
  transition: min-height 0.3s ease;
}

.check-in-tab__scanner-viewport--active {
  min-height: 300px;
}

.check-in-tab__scanner-hint {
  text-align: center;
}

/* Scan result */
.check-in-tab__result {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.check-in-tab__result--success {
  background: color-mix(in srgb, var(--color-success, #27ae60) 10%, transparent);
  color: var(--color-success, #27ae60);
  border: 1px solid color-mix(in srgb, var(--color-success, #27ae60) 20%, transparent);
}

.check-in-tab__result--error {
  background: color-mix(in srgb, var(--color-error, #e74c3c) 10%, transparent);
  color: var(--color-error, #e74c3c);
  border: 1px solid color-mix(in srgb, var(--color-error, #e74c3c) 20%, transparent);
}

.result-enter-active,
.result-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.result-enter-from,
.result-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Loading */
.check-in-tab__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.check-in-tab__spinner {
  color: var(--color-text-muted);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Guest list */
.check-in-tab__arrivals {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.check-in-tab__guest-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.check-in-tab__guest-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.check-in-tab__guest-row:hover {
  background: var(--color-background);
}

.check-in-tab__guest-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.check-in-tab__guest-icon {
  color: var(--color-success, #27ae60);
  flex-shrink: 0;
}

.check-in-tab__guest-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.check-in-tab__guest-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.check-in-tab__guest-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.check-in-tab__undo-btn {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-light);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  transition: all var(--transition-fast);
}

.check-in-tab__undo-btn:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
  background: var(--color-background);
}

/* Empty state */
.check-in-tab__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.check-in-tab__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
  margin-bottom: var(--space-2);
}
</style>
