export default function useSubscription() {
  const { data: subscription, refresh, status } = useLazyFetch('/api/subscriptions', {
    default: () => ({ tier: 'free', status: 'active' }),
  })

  const tier = computed(() => subscription.value?.tier || 'free')
  const isFree = computed(() => tier.value === 'free')
  const isStandard = computed(() => tier.value === 'standard' || tier.value === 'pro')
  const isPro = computed(() => tier.value === 'pro')
  const isActive = computed(() => subscription.value?.status === 'active')
  const loading = computed(() => status.value === 'pending')
  const cancelAtPeriodEnd = computed(() => subscription.value?.cancelAtPeriodEnd || false)
  const currentPeriodEnd = computed(() => subscription.value?.currentPeriodEnd || null)

  async function checkout(newTier: string, interval: 'monthly' | 'yearly' = 'monthly', eventId?: string | number) {
    const result = await $fetch('/api/subscriptions/checkout', {
      method: 'POST',
      body: { tier: newTier, interval, eventId: eventId ? Number(eventId) : undefined },
    })
    if (result.url) {
      window.location.href = result.url
    }
    return result
  }

  async function cancel() {
    const result = await $fetch('/api/subscriptions/cancel', {
      method: 'POST',
    })
    if (result.url) {
      window.location.href = result.url
    }
    return result
  }

  async function upgradeEvent(eventId: string | number, eventTier: string) {
    const result = await $fetch('/api/payments/event-upgrade', {
      method: 'POST',
      body: { eventId: Number(eventId), tier: eventTier },
    })
    if (result.url) {
      window.location.href = result.url
    }
    return result
  }

  return {
    subscription,
    tier,
    isFree,
    isStandard,
    isPro,
    isActive,
    loading,
    cancelAtPeriodEnd,
    currentPeriodEnd,
    refresh,
    checkout,
    cancel,
    upgradeEvent,
  }
}
