const STORAGE_KEY = 'fishionaire-onboarding-dismissed'

export function useOnboarding() {
  const dismissed = useLocalStorage(STORAGE_KEY, {})

  function showTooltip(key) {
    return !dismissed.value[key]
  }

  function dismissTooltip(key) {
    dismissed.value[key] = true
  }

  function resetAll() {
    dismissed.value = {}
  }

  return {
    showTooltip,
    dismissTooltip,
    resetAll,
  }
}
