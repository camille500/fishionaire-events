export function useCountUp(targetValue, options = {}) {
  const {
    duration = 1500,
    suffix = '',
    prefix = '',
    decimals = 0,
    separator = '.',
  } = options

  const displayValue = ref(prefix + '0' + suffix)
  const hasAnimated = ref(false)
  const elementRef = ref(null)

  function parseTarget(val) {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.,]/g, '').replace(',', '.')
      return parseFloat(cleaned) || 0
    }
    return 0
  }

  function formatNumber(num) {
    const fixed = num.toFixed(decimals)
    const [intPart, decPart] = fixed.split('.')
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return prefix + (decPart ? `${formatted},${decPart}` : formatted) + suffix
  }

  function animate() {
    if (hasAnimated.value) return
    hasAnimated.value = true

    const target = parseTarget(unref(targetValue))
    const start = performance.now()

    function step(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased

      displayValue.value = formatNumber(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }

  if (import.meta.client) {
    onMounted(() => {
      if (!elementRef.value) {
        animate()
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            animate()
            observer.disconnect()
          }
        },
        { threshold: 0.3 }
      )

      observer.observe(elementRef.value)

      onUnmounted(() => observer.disconnect())
    })
  }

  return { displayValue, elementRef, animate }
}
