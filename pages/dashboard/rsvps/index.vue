<script setup>
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const toast = useToast()
const { isFree, isStandard, isPro, checkout } = useSubscription()

const { data: rsvps, error, refresh } = await useFetch('/api/rsvps')

// Paywall
const showPaywall = ref(false)
const paywallLoading = ref(false)

function handleCreate() {
  if (isStandard.value || isPro.value) {
    navigateTo('/dashboard/rsvps/create')
  } else {
    showPaywall.value = true
  }
}

async function handleSubscribe(tier, interval = 'monthly') {
  paywallLoading.value = true
  try {
    await checkout(tier, interval)
  } catch {
    toast.add({ title: t('rsvp.payment.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    paywallLoading.value = false
  }
}

async function handleOneTimePurchase() {
  paywallLoading.value = true
  try {
    const { url } = await $fetch('/api/rsvps/checkout', { method: 'POST' })
    if (url) window.location.href = url
  } catch {
    toast.add({ title: t('rsvp.payment.error'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    paywallLoading.value = false
  }
}

const deleteTarget = ref(null)
const deleteLoading = ref(false)

function requestDelete(rsvp) {
  deleteTarget.value = rsvp
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/rsvps/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.add({ title: t('rsvp.deleted'), icon: 'i-lucide-check', color: 'green' })
    deleteTarget.value = null
    refresh()
  } catch {
    toast.add({ title: t('rsvp.deleteError'), icon: 'i-lucide-alert-circle', color: 'red' })
  } finally {
    deleteLoading.value = false
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="rsvps-page">
    <div class="rsvps-page__header">
      <h1 class="rsvps-page__title">{{ t('rsvp.title') }}</h1>
      <AppButton variant="primary" size="sm" @click="handleCreate">
        <Icon name="lucide:plus" size="14" />
        {{ t('rsvp.create') }}
      </AppButton>
    </div>

    <div v-if="error" class="rsvps-page__error">
      <AppText size="sm">{{ t('dashboard.errorLoading') }}</AppText>
      <AppButton variant="ghost" size="sm" @click="refresh()">{{ t('dashboard.retry') }}</AppButton>
    </div>

    <div v-else-if="rsvps?.length" class="rsvps-page__grid">
      <div
        v-for="rsvp in rsvps"
        :key="rsvp.id"
        class="rsvp-card"
        @click="navigateTo(`/dashboard/rsvps/${rsvp.id}`)"
      >
        <div class="rsvp-card__header">
          <div v-if="rsvp.coverImageUrl" class="rsvp-card__cover" :style="{ backgroundImage: `url(${rsvp.coverImageUrl})` }" />
          <div v-else class="rsvp-card__cover rsvp-card__cover--placeholder">
            <Icon name="lucide:calendar-check" size="28" />
          </div>
        </div>
        <div class="rsvp-card__body">
          <h3 class="rsvp-card__title">{{ rsvp.title }}</h3>
          <div class="rsvp-card__meta">
            <span class="rsvp-card__stat">
              <Icon name="lucide:users" size="13" />
              {{ rsvp.invitationCount || 0 }}{{ rsvp.guestLimit ? `/${rsvp.guestLimit}` : '' }}
            </span>
            <span class="rsvp-card__date">{{ formatDate(rsvp.createdAt) }}</span>
          </div>
        </div>
        <button class="rsvp-card__delete" @click.stop="requestDelete(rsvp)" :title="t('rsvp.delete')">
          <Icon name="lucide:trash-2" size="14" />
        </button>
      </div>
    </div>

    <EmptyState
      v-else
      icon="calendar-check"
      :title="t('rsvp.emptyState.title')"
      :description="t('rsvp.emptyState.description')"
      :cta-label="t('rsvp.create')"
      @cta-click="handleCreate"
    />

    <!-- Paywall overlay -->
    <Transition name="paywall-fade">
      <div v-if="showPaywall" class="paywall-backdrop" @click.self="showPaywall = false">
        <div class="paywall">
          <button class="paywall__close" @click="showPaywall = false">
            <Icon name="lucide:x" size="18" />
          </button>

          <div class="paywall__icon">
            <Icon name="lucide:lock" size="32" />
          </div>

          <h2 class="paywall__title">{{ t('rsvp.paywall.title') }}</h2>
          <p class="paywall__desc">{{ t('rsvp.paywall.description') }}</p>

          <!-- Option 1: Subscribe -->
          <div class="paywall__section">
            <h3 class="paywall__section-title">{{ t('rsvp.paywall.subscribeTitle') }}</h3>
            <p class="paywall__section-desc">{{ t('rsvp.paywall.subscribeDesc') }}</p>

            <div class="paywall__plans">
              <div class="paywall__plan">
                <div class="paywall__plan-header">
                  <span class="paywall__plan-name">Standard</span>
                  <span class="paywall__plan-price">&euro;14,99<span class="paywall__plan-period">/{{ t('rsvp.paywall.month') }}</span></span>
                </div>
                <div class="paywall__plan-actions">
                  <AppButton variant="outline" size="sm" :loading="paywallLoading" @click="handleSubscribe('standard', 'monthly')">
                    {{ t('rsvp.paywall.monthly') }}
                  </AppButton>
                  <AppButton variant="outline" size="sm" :loading="paywallLoading" @click="handleSubscribe('standard', 'yearly')">
                    {{ t('rsvp.paywall.yearly') }}
                  </AppButton>
                </div>
              </div>

              <div class="paywall__plan paywall__plan--highlighted">
                <div class="paywall__plan-header">
                  <span class="paywall__plan-name">Pro</span>
                  <span class="paywall__plan-price">&euro;29,99<span class="paywall__plan-period">/{{ t('rsvp.paywall.month') }}</span></span>
                </div>
                <div class="paywall__plan-actions">
                  <AppButton variant="outline" size="sm" :loading="paywallLoading" @click="handleSubscribe('pro', 'monthly')">
                    {{ t('rsvp.paywall.monthly') }}
                  </AppButton>
                  <AppButton variant="outline" size="sm" :loading="paywallLoading" @click="handleSubscribe('pro', 'yearly')">
                    {{ t('rsvp.paywall.yearly') }}
                  </AppButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="paywall__divider">
            <span>{{ t('rsvp.paywall.or') }}</span>
          </div>

          <!-- Option 2: One-time purchase -->
          <div class="paywall__section">
            <h3 class="paywall__section-title">{{ t('rsvp.paywall.oneTimeTitle') }}</h3>
            <p class="paywall__section-desc">{{ t('rsvp.paywall.oneTimeDesc') }}</p>
            <AppButton variant="primary" size="md" :loading="paywallLoading" @click="handleOneTimePurchase">
              {{ t('rsvp.paywall.payOnce') }} — &euro;1,99
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
    <ConfirmModal
      :visible="!!deleteTarget"
      :title="t('rsvp.deleteConfirm.title')"
      :message="t('rsvp.deleteConfirm.message')"
      :confirm-text="t('rsvp.deleteConfirm.confirmText')"
      :confirm-label="t('rsvp.deleteConfirm.confirm')"
      variant="danger"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @close="deleteTarget = null"
    />
  </div>
</template>

<style scoped>
.rsvps-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 960px;
  margin: 0 auto;
}

.rsvps-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.rsvps-page__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.rsvps-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.rsvps-page__error {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
}

/* RSVP Card */
.rsvp-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.rsvp-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-accent) 10%, transparent);
  transform: translateY(-2px);
}

.rsvp-card__header {
  height: 100px;
  overflow: hidden;
}

.rsvp-card__cover {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.rsvp-card__cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 15%, transparent), color-mix(in srgb, var(--color-accent) 5%, transparent));
  color: var(--color-accent);
}

.rsvp-card__body {
  padding: var(--space-3) var(--space-4) var(--space-4);
}

.rsvp-card__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rsvp-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rsvp-card__stat {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.rsvp-card__delete {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.rsvp-card:hover .rsvp-card__delete {
  opacity: 1;
}

.rsvp-card__delete:hover {
  background: var(--color-error);
}

/* Paywall */
.paywall-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: var(--space-4);
}

.paywall {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
}

.paywall__close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.paywall__close:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.paywall__icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  margin-bottom: var(--space-4);
}

.paywall__title {
  font-family: var(--font-family-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.paywall__desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--space-6);
}

.paywall__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.paywall__section-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.paywall__section-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.paywall__plans {
  display: flex;
  gap: var(--space-3);
}

.paywall__plan {
  flex: 1;
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.paywall__plan--highlighted {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 3%, transparent);
}

.paywall__plan-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}

.paywall__plan-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.paywall__plan-price {
  font-weight: var(--font-weight-bold);
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.paywall__plan-period {
  font-weight: var(--font-weight-normal);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.paywall__plan-actions {
  display: flex;
  gap: var(--space-2);
}

.paywall__divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-6) 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.paywall__divider::before,
.paywall__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

/* Transitions */
.paywall-fade-enter-active,
.paywall-fade-leave-active {
  transition: opacity 0.2s ease;
}

.paywall-fade-enter-active .paywall,
.paywall-fade-leave-active .paywall {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.paywall-fade-enter-from,
.paywall-fade-leave-to {
  opacity: 0;
}

.paywall-fade-enter-from .paywall,
.paywall-fade-leave-to .paywall {
  transform: scale(0.95);
  opacity: 0;
}

@media (max-width: 640px) {
  .rsvps-page__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .rsvps-page__grid {
    grid-template-columns: 1fr;
  }

  .paywall {
    padding: var(--space-6);
  }

  .paywall__plans {
    flex-direction: column;
  }
}
</style>
