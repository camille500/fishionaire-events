const STORAGE_KEY = 'fishionaire-onboarding-dismissed'

export function useOnboarding() {
  const dismissed = useLocalStorage<Record<string, boolean>>(STORAGE_KEY, {})

  function showTooltip(key: string): boolean {
    return !dismissed.value[key]
  }

  function dismissTooltip(key: string): void {
    dismissed.value[key] = true
  }

  function resetAll(): void {
    dismissed.value = {}
  }

  return {
    showTooltip,
    dismissTooltip,
    resetAll,
  }
}
