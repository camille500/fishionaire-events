import type { Ref } from 'vue'

interface CountUpOptions {
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  separator?: string
}

export function useCountUp(targetValue: Ref<number | string> | number | string, options: CountUpOptions = {}) {
  const {
    duration = 1500,
    suffix = '',
    prefix = '',
    decimals = 0,
    separator = '.',
  } = options

  const displayValue: Ref<string> = ref(prefix + '0' + suffix)
  const hasAnimated: Ref<boolean> = ref(false)
  const elementRef: Ref<HTMLElement | null> = ref(null)

  function parseTarget(val: number | string): number {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.,]/g, '').replace(',', '.')
      return parseFloat(cleaned) || 0
    }
    return 0
  }

  function formatNumber(num: number): string {
    const fixed = num.toFixed(decimals)
    const [intPart, decPart] = fixed.split('.')
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return prefix + (decPart ? `${formatted},${decPart}` : formatted) + suffix
  }

  function animate(): void {
    if (hasAnimated.value) return
    hasAnimated.value = true

    const target = parseTarget(unref(targetValue))
    const start = performance.now()

    function step(now: number): void {
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
