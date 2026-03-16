import OpenAI from 'openai'
import LlmSettingsController from './llmSettingsController'

type Tone = 'formeel' | 'vriendelijk' | 'speels' | 'professioneel' | 'feestelijk' | 'casual' | 'custom'
type Length = 'kort' | 'middel' | 'lang'
type Language = 'nl' | 'en'

const VALID_TONES: Tone[] = ['formeel', 'vriendelijk', 'speels', 'professioneel', 'feestelijk', 'casual', 'custom']
const VALID_LENGTHS: Length[] = ['kort', 'middel', 'lang']

const TONE_INSTRUCTIONS: Record<string, string> = {
  formeel: 'Write in a formal, polished tone. Use proper language and a respectful, professional style.',
  vriendelijk: 'Write in a warm, friendly tone. Be inviting and approachable, like talking to a good friend.',
  speels: 'Write in a playful, fun tone. Be creative, use humor and make it exciting to read.',
  professioneel: 'Write in a professional, business-like tone. Be clear, concise and authoritative.',
  feestelijk: 'Write in a festive, celebratory tone. Be enthusiastic, joyful and create a sense of excitement.',
  casual: 'Write in a casual, relaxed tone. Be laid-back, conversational and easy-going.',
}

const LENGTH_INSTRUCTIONS: Record<Length, string> = {
  kort: 'Keep it concise, around 2-3 sentences (max 50 words).',
  middel: 'Write a medium-length description, around 4-6 sentences (approximately 100-120 words).',
  lang: 'Write a detailed, rich description of around 8-12 sentences (approximately 200-250 words).',
}

interface SystemPromptParams {
  tone: Tone
  toneCustom?: string | null
  language: Language
  length: Length
  eventType: string
  includeEmojis: boolean
  extraContext?: string | null
}

interface GenerateDescriptionParams {
  prompt: string
  tone?: Tone
  toneCustom?: string | null
  language?: Language
  length?: Length
  eventType?: string
  includeEmojis?: boolean
  refineInstruction?: string
  previousText?: string
  clerkId?: string
  eventId?: string
}

export default class AiController {
  static #getClient(): OpenAI {
    const config = useRuntimeConfig()
    if (!config.openaiApiKey) {
      throw createError({ statusCode: 502, statusMessage: 'AI service is not configured' })
    }
    return new OpenAI({ apiKey: config.openaiApiKey as string })
  }

  static buildSystemPrompt({ tone, toneCustom, language, length, eventType, includeEmojis, extraContext }: SystemPromptParams): string {
    const languageInstruction = language === 'en'
      ? 'Write entirely in English.'
      : 'Write entirely in Dutch (Nederlands).'

    const toneInstruction = tone === 'custom' && toneCustom
      ? `Write in the following tone: ${toneCustom}`
      : TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.vriendelijk
    const lengthInstruction = LENGTH_INSTRUCTIONS[length] || LENGTH_INSTRUCTIONS.middel

    const eventTypeInstruction = eventType
      ? `This is a ${eventType} event. Tailor the description to fit this type of event.`
      : ''

    const emojiInstruction = includeEmojis
      ? 'Include relevant emojis throughout the text to make it visually appealing.'
      : 'Do not use any emojis.'

    const extraContextInstruction = extraContext
      ? `Additional instructions from the user: ${extraContext}`
      : ''

    return [
      'You are a professional event copywriter for Fishionaire Events, a platform for planning events like birthdays, weddings, baby showers, dinners, and more.',
      'Your task is to write an inviting event description based on the user\'s short summary.',
      'The description should make people excited to attend the event.',
      '',
      toneInstruction,
      languageInstruction,
      lengthInstruction,
      eventTypeInstruction,
      emojiInstruction,
      extraContextInstruction,
      '',
      'Output ONLY the event description text. Do not include a title, heading, or any meta-commentary.',
    ].filter(Boolean).join('\n')
  }

  static async *generateDescriptionStream({
    prompt,
    tone,
    toneCustom,
    language = 'nl',
    length = 'middel',
    eventType = '',
    includeEmojis = false,
    refineInstruction = '',
    previousText = '',
    clerkId,
    eventId,
  }: GenerateDescriptionParams): AsyncGenerator<string> {
    if (!prompt || !prompt.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'A prompt is required' })
    }

    // Resolve LLM settings: per-request > event > account > default
    let resolvedTone: Tone = tone || 'vriendelijk'
    let resolvedToneCustom: string | null = toneCustom || null
    let resolvedExtraContext: string | null = null

    if (clerkId) {
      const settings = await LlmSettingsController.resolveSettings(clerkId, eventId)
      if (!tone) resolvedTone = settings.tone as Tone
      if (!toneCustom) resolvedToneCustom = settings.toneCustom
      resolvedExtraContext = settings.extraContext
    }

    if (resolvedTone && !VALID_TONES.includes(resolvedTone)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}` })
    }

    if (length && !VALID_LENGTHS.includes(length)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid length. Must be one of: ${VALID_LENGTHS.join(', ')}` })
    }

    const client = this.#getClient()
    const systemPrompt = this.buildSystemPrompt({ tone: resolvedTone, toneCustom: resolvedToneCustom, language, length, eventType, includeEmojis, extraContext: resolvedExtraContext })

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt.trim() },
    ]

    if (previousText && refineInstruction) {
      messages.push(
        { role: 'assistant', content: previousText },
        { role: 'user', content: `Please adjust the description above: ${refineInstruction}` }
      )
    }

    try {
      const stream = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
        max_tokens: 500,
        temperature: 0.8,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    } catch (err: any) {
      if (err.status === 401) {
        throw createError({ statusCode: 502, statusMessage: 'AI service configuration error' })
      }
      if (err.status === 429) {
        throw createError({ statusCode: 429, statusMessage: 'AI service is busy, please try again later' })
      }
      throw createError({ statusCode: 502, statusMessage: 'AI service unavailable' })
    }
  }
}
