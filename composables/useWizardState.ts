interface WizardStep {
  id: string
  icon: string
  slot: string
}

interface WizardSubEvent {
  id: string
  title: string
  durationMinutes: number | null
  description: string
}

interface WizardFormData {
  selectedType: string
  title: string
  eventDate: string
  location: string
  description: string
  coverImageUrl: string
  coverImageKey: string
  subEvents: WizardSubEvent[]
  selectedTier: string
}

interface WizardDraft extends WizardFormData {
  currentStep: number
  startMode: string
  aiPrefilled: boolean
  savedAt: number | null
}

interface AiBuildResult {
  eventType?: string
  title?: string
  description?: string
  dateSuggestion?: { suggestedTime?: string, isoDate?: string, dayOfWeek?: string }
  activities?: Array<{ title: string, durationMinutes?: number, description?: string }>
  location?: string
}

interface WizardSubmissionData {
  title: string
  tier: string
  eventType: string | null
  eventDate: string | null
  location: string | null
  description: string | null
  coverImageUrl: string | null
  coverImageKey: string | null
  subEvents: Array<{ title: string, durationMinutes: number | null }>
}

const WIZARD_KEY: symbol = Symbol('wizardState')
const DRAFT_STORAGE_KEY = 'fishionaire-wizard-draft'

const ALL_STEPS: WizardStep[] = [
  { id: 'start', icon: 'i-lucide-rocket', slot: 'start' },
  { id: 'info', icon: 'i-lucide-file-text', slot: 'info' },
  { id: 'tier', icon: 'i-lucide-crown', slot: 'tier' },
  { id: 'review', icon: 'i-lucide-check-circle', slot: 'review' },
]

// Steps to skip when AI has prefilled the form
const AI_SKIP_STEPS = new Set(['tier'])

const EVENT_TYPES: string[] = ['birthday', 'wedding', 'baby_shower', 'dinner', 'corporate', 'other']

function defaultFormData(): WizardFormData {
  return {
    selectedType: '',
    title: '',
    eventDate: '',
    location: '',
    description: '',
    coverImageUrl: '',
    coverImageKey: '',
    subEvents: [],
    selectedTier: 'free',
  }
}

function defaultState(): WizardDraft {
  return {
    ...defaultFormData(),
    currentStep: 0,
    startMode: '', // 'manual' | 'ai'
    aiPrefilled: false,
    savedAt: null,
  }
}

export function useWizardStateProvider() {
  const { t } = useI18n()

  // Draft persistence
  const savedDraft = useLocalStorage(DRAFT_STORAGE_KEY, null, {
    serializer: {
      read: (v) => {
        try { return v ? JSON.parse(v) : null }
        catch { return null }
      },
      write: (v) => JSON.stringify(v),
    },
  })

  const hasDraft = computed(() => {
    return savedDraft.value !== null && savedDraft.value?.title?.trim()
  })

  // Form state
  const form = reactive(defaultFormData())
  const currentStep = ref(0)
  const startMode = ref('') // 'manual' | 'ai'
  const aiPrefilled = ref(false)
  const direction = ref<1 | -1>(1) // 1 = forward, -1 = backward

  // Touched fields for validation UX
  const touched = reactive<Record<string, boolean>>({
    title: false,
  })

  // Active steps: skip type & tier when AI prefilled
  const activeSteps = computed<WizardStep[]>(() => {
    if (aiPrefilled.value) {
      return ALL_STEPS.filter((s) => !AI_SKIP_STEPS.has(s.id))
    }
    return ALL_STEPS
  })

  // Per-step validation
  const stepValidation = computed(() => {
    return {
      start: startMode.value !== '',
      info: form.title.trim().length > 0,
      tier: true, // always passable (defaults to free)
      review: form.title.trim().length > 0,
    }
  })

  const canProceed = computed(() => {
    const step = activeSteps.value[currentStep.value]
    if (!step) return false
    return stepValidation.value[step.id] ?? false
  })

  // Inline validation errors (only shown after touch)
  const errors = computed(() => {
    const errs = {}
    if (touched.title && !form.title.trim()) {
      errs.title = t('wizard.validation.titleRequired')
    } else if (touched.title && form.title.length > 100) {
      errs.title = t('wizard.validation.titleTooLong')
    }
    return errs
  })

  // Step navigation (uses activeSteps for dynamic step count)
  function next(): boolean {
    if (!canProceed.value) return false
    if (currentStep.value < activeSteps.value.length - 1) {
      direction.value = 1
      currentStep.value++
      return true
    }
    return false
  }

  function prev(): boolean {
    if (currentStep.value > 0) {
      direction.value = -1
      currentStep.value--
      return true
    }
    return false
  }

  function goToStep(index: number): void {
    if (index >= 0 && index < activeSteps.value.length) {
      direction.value = index > currentStep.value ? 1 : -1
      currentStep.value = index
    }
  }

  const hasPrev = computed(() => currentStep.value > 0)
  const hasNext = computed(() => currentStep.value < activeSteps.value.length - 1)
  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === activeSteps.value.length - 1)
  const currentStepId = computed(() => activeSteps.value[currentStep.value]?.id || '')

  // Completion percentage (for progress UI)
  const completionPercentage = computed(() => {
    return Math.round((currentStep.value / (activeSteps.value.length - 1)) * 100)
  })

  // Step items for progress UI
  const stepItems = computed(() => {
    return activeSteps.value.map((step, index) => ({
      ...step,
      title: t(`wizard.steps.${step.id}`),
      description: t(`wizard.steps.${step.id}Description`),
      completed: index < currentStep.value,
      active: index === currentStep.value,
      accessible: index <= currentStep.value,
    }))
  })

  // Draft save (debounced)
  let draftTimer: ReturnType<typeof setTimeout> | null = null
  function saveDraft(): void {
    clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
      savedDraft.value = {
        ...toRaw(form),
        currentStep: currentStep.value,
        startMode: startMode.value,
        aiPrefilled: aiPrefilled.value,
        savedAt: Date.now(),
      }
    }, 500)
  }

  function resumeDraft(): boolean {
    if (!savedDraft.value) return false
    const draft = savedDraft.value
    Object.assign(form, {
      selectedType: draft.selectedType || '',
      title: draft.title || '',
      eventDate: draft.eventDate || '',
      location: draft.location || '',
      description: draft.description || '',
      coverImageUrl: draft.coverImageUrl || '',
      coverImageKey: draft.coverImageKey || '',
      subEvents: draft.subEvents || [],
      selectedTier: draft.selectedTier || 'free',
    })
    currentStep.value = draft.currentStep || 0
    startMode.value = draft.startMode || ''
    aiPrefilled.value = draft.aiPrefilled || false
    return true
  }

  function clearDraft(): void {
    savedDraft.value = null
  }

  function resetWizard(): void {
    Object.assign(form, defaultFormData())
    currentStep.value = 0
    startMode.value = ''
    aiPrefilled.value = false
    direction.value = 1
    Object.keys(touched).forEach((k) => { touched[k] = false })
    clearDraft()
  }

  // Auto-save draft on form changes
  watch([() => ({ ...form }), currentStep], () => {
    if (form.title.trim() || form.selectedType || form.subEvents.length) {
      saveDraft()
    }
  }, { deep: true })

  onUnmounted(() => clearTimeout(draftTimer))

  // Sub-event helpers
  function addSubEvent(): void {
    form.subEvents.push({
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      durationMinutes: null,
      description: '',
    })
  }

  function removeSubEvent(index: number): void {
    form.subEvents.splice(index, 1)
  }

  function updateSubEvent(index: number, val: WizardSubEvent): void {
    form.subEvents[index] = val
  }

  // Select event type + auto-advance
  function selectType(type: string): void {
    form.selectedType = type
  }

  // Populate form from AI build result
  function populateFromAi(data: AiBuildResult): void {
    if (data.eventType) form.selectedType = data.eventType
    if (data.title) form.title = data.title
    if (data.description) form.description = data.description

    // Try to extract date from AI response
    if (data.dateSuggestion) {
      const suggestion = data.dateSuggestion as Record<string, unknown>
      if (suggestion.isoDate && typeof suggestion.isoDate === 'string') {
        // AI returned an ISO date — use directly
        const d = new Date(suggestion.isoDate)
        if (!isNaN(d.getTime())) {
          const y = String(d.getFullYear()).padStart(4, '0')
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const h = String(d.getHours()).padStart(2, '0')
          const min = String(d.getMinutes()).padStart(2, '0')
          form.eventDate = `${y}-${m}-${day}T${h}:${min}`
        }
      }
    }

    if (data.location) form.location = data.location

    if (data.activities?.length) {
      form.subEvents = data.activities.map((a, i) => ({
        id: `ai-${Date.now()}-${i}`,
        title: a.title,
        durationMinutes: a.durationMinutes || null,
        description: a.description || '',
      }))
    }
    aiPrefilled.value = true
  }

  // Build submission body
  function getSubmissionData(): WizardSubmissionData {
    return {
      title: form.title.trim(),
      tier: form.selectedTier,
      eventType: form.selectedType || null,
      eventDate: form.eventDate || null,
      location: form.location || null,
      description: form.description || null,
      coverImageUrl: form.coverImageUrl || null,
      coverImageKey: form.coverImageKey || null,
      subEvents: form.subEvents
        .filter((se) => se.title.trim())
        .map((se) => ({
          title: se.title.trim(),
          durationMinutes: se.durationMinutes,
        })),
    }
  }

  const state = {
    // Constants
    STEPS: activeSteps,
    ALL_STEPS,
    EVENT_TYPES,

    // Form data
    form,
    touched,
    errors,

    // Navigation
    currentStep,
    direction,
    stepItems,
    canProceed,
    hasPrev,
    hasNext,
    isFirstStep,
    isLastStep,
    currentStepId,
    completionPercentage,
    next,
    prev,
    goToStep,

    // Modes
    startMode,
    aiPrefilled,

    // Draft
    hasDraft,
    resumeDraft,
    clearDraft,
    resetWizard,

    // Sub-event helpers
    addSubEvent,
    removeSubEvent,
    updateSubEvent,
    selectType,

    // AI population
    populateFromAi,

    // Submission
    getSubmissionData,

    // Validation
    stepValidation,
  }

  provide(WIZARD_KEY, state)
  return state
}

export function useWizardState() {
  const state = inject(WIZARD_KEY)
  if (!state) throw new Error('useWizardState must be used within a WizardStateProvider')
  return state
}
