const EDITOR_KEY = Symbol('eventEditor')

export function useEventEditorProvider(eventId) {
  const { t } = useI18n()
  const route = useRoute()

  const { data: eventData, error: fetchError } = useFetch(`/api/events/${eventId}`)

  const role = computed(() => eventData.value?.role || 'guest')
  const isOwner = computed(() => role.value === 'owner')
  const canEdit = computed(() => role.value === 'owner' || role.value === 'co_organizer')

  const eventTypes = ['birthday', 'wedding', 'baby_shower', 'dinner', 'corporate', 'other']

  function toLocalDatetime(val) {
    if (!val) return ''
    const d = new Date(val)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }

  function initForm(data) {
    return {
      title: data?.title || '',
      description: data?.description || '',
      eventType: data?.eventType || '',
      eventDate: toLocalDatetime(data?.eventDate),
      eventEndDate: toLocalDatetime(data?.eventEndDate),
      location: data?.location || '',
      maxGuests: data?.maxGuests || '',
      isPrivate: data?.isPrivate ?? true,
    }
  }

  const form = reactive(initForm(eventData.value))

  watch(eventData, (val) => {
    if (val) Object.assign(form, initForm(val))
  })

  const saving = ref(false)
  const saved = ref(false)
  const saveError = ref('')
  let autoSaveTimer = null
  let lastSaved = JSON.stringify(form)

  const isDirty = computed(() => JSON.stringify(form) !== lastSaved)

  async function save() {
    if (!form.title.trim()) return

    saving.value = true
    saveError.value = ''
    saved.value = false

    try {
      const body = {
        title: form.title,
        description: form.description,
        eventType: form.eventType || null,
        eventDate: form.eventDate || null,
        eventEndDate: form.eventEndDate || null,
        location: form.location || null,
        maxGuests: form.maxGuests ? parseInt(form.maxGuests) : null,
        isPrivate: form.isPrivate,
      }

      await $fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        body,
      })

      lastSaved = JSON.stringify(form)
      saved.value = true
      setTimeout(() => { saved.value = false }, 3000)
    } catch (e) {
      saveError.value = e.data?.statusMessage || t('dashboard.eventEditor.errorSaving')
    } finally {
      saving.value = false
    }
  }

  watch(form, () => {
    clearTimeout(autoSaveTimer)
    if (!form.title.trim()) return
    const current = JSON.stringify(form)
    if (current === lastSaved) return
    autoSaveTimer = setTimeout(() => save(), 1500)
  }, { deep: true })

  onUnmounted(() => clearTimeout(autoSaveTimer))

  // Completion tracking
  const completionItems = computed(() => {
    const items = [
      { key: 'title', done: !!form.title.trim() },
      { key: 'date', done: !!form.eventDate },
      { key: 'location', done: !!form.location },
      { key: 'description', done: !!form.description.trim() },
      { key: 'coverImage', done: !!eventData.value?.coverImageUrl },
      { key: 'eventType', done: !!form.eventType },
    ]
    return items
  })

  const completionPercent = computed(() => {
    const done = completionItems.value.filter((i) => i.done).length
    return Math.round((done / completionItems.value.length) * 100)
  })

  const state = {
    eventId,
    eventData,
    fetchError,
    form,
    role,
    isOwner,
    canEdit,
    eventTypes,
    saving,
    saved,
    saveError,
    isDirty,
    save,
    completionItems,
    completionPercent,
  }

  provide(EDITOR_KEY, state)

  return state
}

export function useEventEditor() {
  const state = inject(EDITOR_KEY)
  if (!state) throw new Error('useEventEditor must be used within a provider')
  return state
}
