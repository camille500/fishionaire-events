export function useGreeting() {
  const { t } = useI18n()

  const greetingKey = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'dashboard.greeting.morning'
    if (hour < 18) return 'dashboard.greeting.afternoon'
    return 'dashboard.greeting.evening'
  })

  function getGreeting(name) {
    return t(greetingKey.value, { name })
  }

  return {
    greetingKey,
    getGreeting,
  }
}
