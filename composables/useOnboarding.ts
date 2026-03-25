const STORAGE_KEY = 'fishionaire-onboarding-dismissed'

export function useOnboarding() {
  const dismissed = useLocalStorage<Record<string, boolean>>(STORAGE_KEY, {})
  const sync = useOnboardingSync()

  function showTooltip(key: string): boolean {
    return !dismissed.value[key] && !sync.state.value.dismissedTooltips[key]
  }

  function dismissTooltip(key: string): void {
    dismissed.value[key] = true
    sync.markTooltipDismissed(key)
  }

  function resetAll(): void {
    dismissed.value = {}
    sync.resetAll()
  }

  return {
    showTooltip,
    dismissTooltip,
    resetAll,
  }
}
