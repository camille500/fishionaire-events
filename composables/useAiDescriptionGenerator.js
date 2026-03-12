export default function useAiDescriptionGenerator() {
  const generatedText = ref('')
  const isGenerating = ref(false)
  const error = ref('')
  const history = ref([])
  let abortController = null

  const prompt = ref('')
  const tone = ref('vriendelijk')
  const language = ref('nl')
  const length = ref('middel')
  const eventType = ref('')
  const includeEmojis = ref(false)

  async function generate(options = {}) {
    if (isGenerating.value) return

    const { refineInstruction = '', previousText = '' } = options

    isGenerating.value = true
    error.value = ''
    generatedText.value = ''

    abortController = new AbortController()

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.value,
          tone: tone.value,
          language: language.value,
          length: length.value,
          eventType: eventType.value,
          includeEmojis: includeEmojis.value,
          refineInstruction,
          previousText,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.statusMessage || 'Something went wrong')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: error')) {
            const nextLine = lines[lines.indexOf(line) + 1]
            if (nextLine?.startsWith('data: ')) {
              error.value = nextLine.slice(6)
            }
            continue
          }
          if (line.startsWith('data: ')) {
            generatedText.value += line.slice(6)
          }
        }
      }

      if (buffer.startsWith('data: ')) {
        generatedText.value += buffer.slice(6)
      }

      if (generatedText.value) {
        history.value.unshift(generatedText.value)
        if (history.value.length > 3) {
          history.value.pop()
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      error.value = err.message || 'Something went wrong'
    } finally {
      isGenerating.value = false
      abortController = null
    }
  }

  function refine(instruction) {
    return generate({
      refineInstruction: instruction,
      previousText: generatedText.value,
    })
  }

  function abort() {
    if (abortController) {
      abortController.abort()
      isGenerating.value = false
      abortController = null
    }
  }

  function selectFromHistory(index) {
    generatedText.value = history.value[index]
  }

  function clear() {
    generatedText.value = ''
    error.value = ''
  }

  return {
    prompt,
    tone,
    language,
    length,
    eventType,
    includeEmojis,
    generatedText,
    isGenerating,
    error,
    history,
    generate,
    refine,
    abort,
    selectFromHistory,
    clear,
  }
}
