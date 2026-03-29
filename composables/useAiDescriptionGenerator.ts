interface GenerateOptions {
  refineInstruction?: string
  previousText?: string
}

export default function useAiDescriptionGenerator() {
  const generatedText = ref<string>('')
  const isGenerating = ref<boolean>(false)
  const error = ref<string>('')
  const history = ref<string[]>([])
  let abortController: AbortController | null = null

  const prompt = ref<string>('')
  const tone = ref<string>('vriendelijk')
  const language = ref<string>('nl')
  const length = ref<string>('middel')
  const eventType = ref<string>('')
  const includeEmojis = ref<boolean>(false)
  const eventId = ref<string>('')

  async function generate(options: GenerateOptions = {}): Promise<void> {
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
          eventId: eventId.value || undefined,
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
      refreshNuxtData('ai-token-usage')
    }
  }

  function refine(instruction: string): Promise<void> {
    return generate({
      refineInstruction: instruction,
      previousText: generatedText.value,
    })
  }

  function abort(): void {
    if (abortController) {
      abortController.abort()
      isGenerating.value = false
      abortController = null
    }
  }

  function selectFromHistory(index: number): void {
    generatedText.value = history.value[index]
  }

  function clear(): void {
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
    eventId,
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
