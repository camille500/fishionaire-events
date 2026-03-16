import OpenAI from 'openai'
import LlmSettingsController from './llmSettingsController'

type Language = 'nl' | 'en'

interface SuggestPresentsParams {
  eventType?: string
  eventTitle?: string
  prompt: string
  existingItems?: Array<{ title: string }>
  language?: Language
  clerkId?: string
  eventId?: string
}

interface PresentSuggestion {
  title: string
  description: string
  priceCents: number
  category: string
}

export default class WishlistAiController {
  static #getClient(): OpenAI {
    const config = useRuntimeConfig()
    if (!config.openaiApiKey) {
      throw createError({ statusCode: 502, statusMessage: 'AI service is not configured' })
    }
    return new OpenAI({ apiKey: config.openaiApiKey as string })
  }

  static async #resolveExtraContext(clerkId?: string, eventId?: string): Promise<string | null> {
    if (!clerkId) return null
    const settings = await LlmSettingsController.resolveSettings(clerkId, eventId)
    return settings.extraContext
  }

  static async suggestPresents({ eventType, eventTitle, prompt, existingItems = [], language = 'nl', clerkId, eventId }: SuggestPresentsParams): Promise<{ suggestions: PresentSuggestion[] }> {
    const client = this.#getClient()
    const extraContext = await this.#resolveExtraContext(clerkId, eventId)

    const languageInstruction = language === 'en'
      ? 'Write entirely in English.'
      : 'Write entirely in Dutch (Nederlands).'

    const existingContext = existingItems.length > 0
      ? `The wishlist already has: ${existingItems.map((i) => i.title).join(', ')}. Suggest different items that complement the existing list.`
      : ''

    const categories = 'electronics, books, home, kitchen, fashion, beauty, experiences, toys'

    const systemPrompt = [
      'You are a creative gift suggestion assistant for Fishionaire Events, a Dutch event planning platform.',
      'Suggest 5 unique, thoughtful gift ideas based on the user\'s description.',
      languageInstruction,
      'Focus on gifts that are popular in the Netherlands and available from Dutch retailers.',
      eventType ? `This is for a ${eventType} event.` : '',
      eventTitle ? `The event is called "${eventTitle}".` : '',
      existingContext,
      extraContext ? `Additional context from the organizer: ${extraContext}` : '',
      `Each gift should belong to one of these categories: ${categories}.`,
      'Return a JSON object with a "suggestions" array of exactly 5 objects.',
      'Each object must have: "title" (string), "description" (string, 1-2 sentences), "priceCents" (number, realistic EUR price in cents), "category" (string, one of the categories listed).',
      'Only return valid JSON, nothing else.',
    ].filter(Boolean).join('\n')

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 800,
        temperature: 0.8,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return { suggestions: result.suggestions || [] }
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
