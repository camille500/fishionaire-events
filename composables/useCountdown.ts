export function useCountdown(targetDate: Ref<string | Date | null>) {
  const now = ref(new Date())
  let interval: ReturnType<typeof setInterval> | null = null

  const target = computed(() => {
    if (!targetDate.value) return null
    return new Date(targetDate.value)
  })

  const diff = computed(() => {
    if (!target.value) return null
    return target.value.getTime() - now.value.getTime()
  })

  const isPast = computed(() => diff.value !== null && diff.value <= 0)
  const isToday = computed(() => {
    if (!target.value) return false
    const t = target.value
    const n = now.value
    return t.getFullYear() === n.getFullYear()
      && t.getMonth() === n.getMonth()
      && t.getDate() === n.getDate()
  })

  const days = computed(() => {
    if (!diff.value || diff.value <= 0) return 0
    return Math.floor(diff.value / (1000 * 60 * 60 * 24))
  })

  const hours = computed(() => {
    if (!diff.value || diff.value <= 0) return 0
    return Math.floor((diff.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  })

  const minutes = computed(() => {
    if (!diff.value || diff.value <= 0) return 0
    return Math.floor((diff.value % (1000 * 60 * 60)) / (1000 * 60))
  })

  const hasTarget = computed(() => !!target.value)

  onMounted(() => {
    interval = setInterval(() => {
      now.value = new Date()
    }, 60000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return {
    days,
    hours,
    minutes,
    isPast,
    isToday,
    hasTarget,
  }
}
