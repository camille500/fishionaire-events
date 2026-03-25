const STORAGE_KEY = 'fishionaire-onboarding-state'

interface OnboardingClientState {
  dashboardTourDone: boolean
  eventCreationTourDone: boolean
  dismissedTooltips: Record<string, boolean>
}

const defaultState: OnboardingClientState = {
  dashboardTourDone: false,
  eventCreationTourDone: false,
  dismissedTooltips: {},
}

export function useOnboardingSync() {
  const state = useLocalStorage<OnboardingClientState>(STORAGE_KEY, { ...defaultState })
  const isLoaded = ref(false)

  function merge(remote: OnboardingClientState) {
    state.value = {
      dashboardTourDone: state.value.dashboardTourDone || remote.dashboardTourDone,
      eventCreationTourDone: state.value.eventCreationTourDone || remote.eventCreationTourDone,
      dismissedTooltips: { ...remote.dismissedTooltips, ...state.value.dismissedTooltips },
    }
  }

  let syncTimeout: ReturnType<typeof setTimeout> | null = null

  function debouncedPush() {
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(async () => {
      try {
        await $fetch('/api/onboarding', {
          method: 'PUT',
          body: state.value,
        })
      } catch {
        // Silent fail — localStorage is the source of truth for UX
      }
    }, 1000)
  }

  async function syncFromServer() {
    try {
      const remote = await $fetch<OnboardingClientState>('/api/onboarding')
      if (remote) merge(remote)
      isLoaded.value = true
    } catch {
      isLoaded.value = true
    }
  }

  async function markTourDone(tourId: string) {
    if (tourId === 'dashboard') {
      state.value = { ...state.value, dashboardTourDone: true }
    } else if (tourId === 'event-creation') {
      state.value = { ...state.value, eventCreationTourDone: true }
    }
    debouncedPush()
  }

  function markTooltipDismissed(key: string) {
    state.value = {
      ...state.value,
      dismissedTooltips: { ...state.value.dismissedTooltips, [key]: true },
    }
    debouncedPush()
  }

  async function resetTour(tourId: string) {
    if (tourId === 'dashboard') {
      state.value = { ...state.value, dashboardTourDone: false }
    } else if (tourId === 'event-creation') {
      state.value = { ...state.value, eventCreationTourDone: false }
    }
    debouncedPush()
  }

  async function resetAll() {
    state.value = { ...defaultState }
    try {
      await $fetch('/api/onboarding/reset', { method: 'POST' })
    } catch {
      // Silent fail
    }
  }

  return {
    state: readonly(state),
    isLoaded: readonly(isLoaded),
    markTourDone,
    resetTour,
    markTooltipDismissed,
    resetAll,
    syncFromServer,
  }
}
