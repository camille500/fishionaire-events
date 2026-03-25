export interface TourStep {
  key: string
  target: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
  spotlightPadding?: number
  onBeforeShow?: () => void | Promise<void>
}

export interface TourDefinition {
  id: string
  steps: TourStep[]
}

const TOUR_INJECTION_KEY = Symbol('tour') as InjectionKey<ReturnType<typeof createTour>>

function createTour() {
  const tours = ref<Map<string, TourDefinition>>(new Map())
  const activeTourId = ref<string | null>(null)
  const currentStepIndex = ref(0)
  const targetRect = ref<DOMRect | null>(null)
  const isActive = ref(false)

  const sync = useOnboardingSync()
  const route = useRoute()

  const activeTour = computed(() => {
    if (!activeTourId.value) return null
    return tours.value.get(activeTourId.value) || null
  })

  const totalSteps = computed(() => activeTour.value?.steps.length || 0)

  const currentStepData = computed(() => {
    if (!activeTour.value) return null
    return activeTour.value.steps[currentStepIndex.value] || null
  })

  let cleanupTarget: (() => void) | null = null

  function clearTargetHighlight() {
    if (cleanupTarget) {
      cleanupTarget()
      cleanupTarget = null
    }
  }

  function findTarget(selector: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-tour="${selector}"]`)
  }

  async function waitForTarget(selector: string, timeout = 2000): Promise<HTMLElement | null> {
    const el = findTarget(selector)
    if (el) return el

    return new Promise((resolve) => {
      const start = Date.now()
      function poll() {
        const el = findTarget(selector)
        if (el) return resolve(el)
        if (Date.now() - start > timeout) return resolve(null)
        requestAnimationFrame(poll)
      }
      requestAnimationFrame(poll)
    })
  }

  function updateTargetRect() {
    if (!currentStepData.value) {
      targetRect.value = null
      return
    }
    const el = findTarget(currentStepData.value.target)
    if (el) {
      targetRect.value = el.getBoundingClientRect()
    } else {
      targetRect.value = null
    }
  }

  let resizeObserver: ResizeObserver | null = null
  let scrollHandler: (() => void) | null = null

  function startObserving() {
    stopObserving()

    scrollHandler = () => updateTargetRect()
    window.addEventListener('scroll', scrollHandler, true)
    window.addEventListener('resize', scrollHandler)

    resizeObserver = new ResizeObserver(() => updateTargetRect())
    resizeObserver.observe(document.body)
  }

  function stopObserving() {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler, true)
      window.removeEventListener('resize', scrollHandler)
      scrollHandler = null
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  function isInFixedContainer(el: HTMLElement): boolean {
    let current: HTMLElement | null = el
    while (current && current !== document.body) {
      const pos = window.getComputedStyle(current).position
      if (pos === 'fixed' || pos === 'sticky') return true
      current = current.parentElement
    }
    return false
  }

  async function highlightStep() {
    clearTargetHighlight()

    const step = currentStepData.value
    if (!step) return

    if (step.onBeforeShow) {
      await step.onBeforeShow()
    }

    const el = await waitForTarget(step.target)
    if (!el) {
      targetRect.value = null
      return
    }

    const isFixed = isInFixedContainer(el)

    // Only scroll into view for non-fixed elements
    if (!isFixed) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await new Promise((resolve) => setTimeout(resolve, 350))
    }

    const originalZIndex = el.style.zIndex
    const originalPosition = el.style.position
    const wasStatic = !isFixed && window.getComputedStyle(el).position === 'static'

    // Only override position for non-fixed static elements
    if (wasStatic) {
      el.style.position = 'relative'
    }
    el.style.zIndex = '10000'

    cleanupTarget = () => {
      el.style.zIndex = originalZIndex
      if (wasStatic) {
        el.style.position = originalPosition
      }
    }

    updateTargetRect()
  }

  function registerTour(tour: TourDefinition) {
    tours.value.set(tour.id, tour)
  }

  async function startTour(tourId: string) {
    const tour = tours.value.get(tourId)
    if (!tour || tour.steps.length === 0) return

    activeTourId.value = tourId
    currentStepIndex.value = 0
    isActive.value = true
    startObserving()
    await highlightStep()
  }

  async function nextStep() {
    if (!activeTour.value) return
    if (currentStepIndex.value >= totalSteps.value - 1) {
      completeTour()
      return
    }
    clearTargetHighlight()
    currentStepIndex.value++
    await highlightStep()
  }

  async function prevStep() {
    if (currentStepIndex.value <= 0) return
    clearTargetHighlight()
    currentStepIndex.value--
    await highlightStep()
  }

  async function skipStep() {
    await nextStep()
  }

  function completeTour() {
    const tourId = activeTourId.value
    clearTargetHighlight()
    stopObserving()
    isActive.value = false
    activeTourId.value = null
    currentStepIndex.value = 0
    targetRect.value = null
    if (tourId) {
      sync.markTourDone(tourId)
    }
  }

  function skipAll() {
    completeTour()
  }

  // Cancel tour on route change
  watch(() => route.fullPath, () => {
    if (isActive.value) {
      clearTargetHighlight()
      stopObserving()
      isActive.value = false
      activeTourId.value = null
      currentStepIndex.value = 0
      targetRect.value = null
    }
  })

  return {
    isActive: readonly(isActive),
    currentStep: readonly(currentStepIndex),
    currentStepData,
    totalSteps,
    targetRect: readonly(targetRect),
    activeTourId: readonly(activeTourId),
    registerTour,
    startTour,
    nextStep,
    prevStep,
    skipStep,
    skipAll,
    completeTour,
  }
}

export function provideTour() {
  const tour = createTour()
  provide(TOUR_INJECTION_KEY, tour)
  return tour
}

export function useTour() {
  const tour = inject(TOUR_INJECTION_KEY)
  if (!tour) {
    throw new Error('useTour() must be used within a component that has called provideTour()')
  }
  return tour
}
