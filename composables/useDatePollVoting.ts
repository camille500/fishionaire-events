export function useDatePollVoting(
  eventId: Ref<number> | number,
  token: Ref<string> | string,
  initialEmail: Ref<string> | string,
  initialName: Ref<string> | string,
) {
  const { t } = useI18n()

  const poll = ref<any>(null)
  const loading = ref(true)
  const submitting = ref(false)
  const submitted = ref(false)
  const error = ref<string | null>(null)
  const savingVoteId = ref<number | null>(null)

  const email = ref(unref(initialEmail))
  const name = ref(unref(initialName))
  const votes = ref<Record<string, string>>({})

  // Sync email/name if refs change after mount (async data)
  watch(() => unref(initialEmail), (v) => { if (v) email.value = v })
  watch(() => unref(initialName), (v) => { if (v) name.value = v })

  // When on invite page, the guest is already identified — no need for manual form
  const isIdentified = computed(() => !!unref(token) || !!unref(initialEmail))

  const hasVoted = computed(() => Object.keys(votes.value).length > 0)

  async function fetchPoll() {
    loading.value = true
    error.value = null
    try {
      poll.value = await $fetch(`/api/events/${unref(eventId)}/date-poll/vote`, {
        query: { email: unref(initialEmail) || undefined },
      })
      if (poll.value?.options) {
        for (const opt of poll.value.options) {
          if (opt.ownVote) votes.value[opt.id] = opt.ownVote
        }
      }
    } catch (err: any) {
      error.value = err.statusMessage || t('common.errorGeneric')
    } finally {
      loading.value = false
    }
  }

  async function setVote(optionId: string | number, status: string) {
    if (votes.value[optionId] === status) {
      delete votes.value[optionId]
    } else {
      votes.value[optionId] = status
    }

    // Auto-save when the guest is already identified via invite token
    if (isIdentified.value) {
      await autoSaveVotes(optionId)
    }
  }

  async function autoSaveVotes(optionId: string | number) {
    savingVoteId.value = optionId as number
    error.value = null
    const votePayload = Object.entries(votes.value).map(([id, status]) => ({ optionId: id, status }))
    if (votePayload.length === 0) {
      savingVoteId.value = null
      return
    }
    try {
      const tok = unref(token)
      if (tok) {
        // Token-based endpoint — no email needed, works for +1 invitees
        await $fetch(`/api/invite/${tok}/vote`, {
          method: 'POST',
          body: { votes: votePayload },
        })
      } else {
        // Fallback to email-based endpoint
        await $fetch(`/api/events/${unref(eventId)}/date-poll/vote`, {
          method: 'POST',
          body: {
            email: email.value,
            name: name.value || null,
            votes: votePayload,
          },
        })
      }
    } catch (err: any) {
      error.value = err.data?.message || err.statusMessage || t('common.errorGeneric')
    } finally {
      savingVoteId.value = null
    }
  }

  async function submit() {
    if (!email.value || !email.value.includes('@')) return
    if (Object.keys(votes.value).length === 0) return

    submitting.value = true
    error.value = null
    try {
      await $fetch(`/api/events/${unref(eventId)}/date-poll/vote`, {
        method: 'POST',
        body: {
          email: email.value,
          name: name.value || null,
          votes: Object.entries(votes.value).map(([optionId, status]) => ({ optionId, status })),
        },
      })
      submitted.value = true
    } catch (err: any) {
      error.value = err.data?.message || err.statusMessage || t('common.errorGeneric')
    } finally {
      submitting.value = false
    }
  }

  return {
    poll,
    loading,
    submitting,
    submitted,
    error,
    savingVoteId,
    email,
    name,
    votes,
    isIdentified,
    hasVoted,
    fetchPoll,
    setVote,
    submit,
  }
}
