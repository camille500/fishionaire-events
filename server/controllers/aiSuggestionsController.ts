import OpenAI from 'openai'

type Language = 'nl' | 'en'

interface SuggestTitlesParams {
  eventType?: string
  context?: string
  language?: Language
}

interface SuggestSubEventsParams {
  eventType?: string
  eventTitle?: string
  description?: string
  eventDate?: string
  existingSubEvents?: Array<{ title: string }>
  language?: Language
}

interface SuggestTimelineParams {
  eventType?: string
  eventDate?: string
  subEvents?: Array<{ title: string, durationMinutes?: number }>
  language?: Language
}

interface BuildEventParams {
  description: string
  language?: Language
}

interface TitleSuggestions {
  suggestions: string[]
}

interface SubEventSuggestion {
  title: string
  durationMinutes: number
}

interface TimelineItem {
  title: string
  startTime: string
  endTime: string
}

interface BuildEventResult {
  eventType: string
  title: string
  description: string
  dateSuggestion: { dayOfWeek: string, timeOfDay: string, suggestedTime: string } | null
  activities: Array<{ title: string, durationMinutes: number }>
}

export default class AiSuggestionsController {
  static #getClient(): OpenAI {
    const config = useRuntimeConfig()
    if (!config.openaiApiKey) {
      throw createError({ statusCode: 502, statusMessage: 'AI service is not configured' })
    }
    return new OpenAI({ apiKey: config.openaiApiKey as string })
  }

  static async suggestTitles({ eventType, context, language = 'en' }: SuggestTitlesParams): Promise<TitleSuggestions> {
    const client = this.#getClient()

    const languageInstruction = language === 'en'
      ? 'Write entirely in English.'
      : 'Write entirely in Dutch (Nederlands).'

    const systemPrompt = [
      'You are a creative event naming assistant for Fishionaire Events.',
      'Generate 3 unique, catchy event titles.',
      languageInstruction,
      eventType ? `This is a ${eventType} event. Tailor names accordingly.` : '',
      'Return a JSON object with a "suggestions" array of exactly 3 strings.',
      'Only return valid JSON, nothing else.',
    ].filter(Boolean).join('\n')

    const userPrompt = context
      ? `Suggest event titles based on this context: ${context}`
      : `Suggest creative ${eventType || 'event'} titles.`

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 200,
        temperature: 0.9,
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

  static async suggestSubEvents({ eventType, eventTitle, description, eventDate, existingSubEvents = [], language = 'en' }: SuggestSubEventsParams): Promise<{ suggestions: SubEventSuggestion[] }> {
    const client = this.#getClient()

    const languageInstruction = language === 'en'
      ? 'Write entirely in English.'
      : 'Write entirely in Dutch (Nederlands).'

    const existingContext = existingSubEvents.length > 0
      ? `The event already has these activities: ${existingSubEvents.map((se) => se.title).join(', ')}. Suggest complementary activities that don't duplicate these.`
      : ''

    const systemPrompt = [
      'You are an event planning assistant for Fishionaire Events.',
      'Suggest activities/sub-events for an event.',
      languageInstruction,
      eventType ? `This is a ${eventType} event.` : '',
      eventTitle ? `The event is called "${eventTitle}".` : '',
      description ? `The event description is: "${description}"` : '',
      eventDate ? `The event is scheduled for ${eventDate}.` : '',
      existingContext,
      'Use the event details above to suggest activities that fit the specific context and tone of this event.',
      'Return a JSON object with a "suggestions" array of objects, each with "title" (string) and "durationMinutes" (number).',
      'Suggest 3-5 activities with realistic durations.',
      'Only return valid JSON, nothing else.',
    ].filter(Boolean).join('\n')

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Suggest activities for this ${eventType || 'event'}.` },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 400,
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

  static async suggestTimeline({ eventType, eventDate, subEvents = [], language = 'en' }: SuggestTimelineParams): Promise<{ items: TimelineItem[] }> {
    const client = this.#getClient()

    const languageInstruction = language === 'en'
      ? 'Write entirely in English.'
      : 'Write entirely in Dutch (Nederlands).'

    const subEventsContext = subEvents.length > 0
      ? `The event has these activities: ${subEvents.map((se) => `${se.title} (${se.durationMinutes || '?'} min)`).join(', ')}.`
      : ''

    const systemPrompt = [
      'You are an event timeline planner for Fishionaire Events.',
      'Create a realistic timeline for an event.',
      languageInstruction,
      eventType ? `This is a ${eventType} event.` : '',
      eventDate ? `The event is on ${eventDate}.` : '',
      subEventsContext,
      'Return a JSON object with an "items" array of objects, each with "title" (string), "startTime" (HH:MM format), and "endTime" (HH:MM format).',
      'Create a logical, well-paced timeline. Include setup and transition time between activities.',
      'Only return valid JSON, nothing else.',
    ].filter(Boolean).join('\n')

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a timeline for this ${eventType || 'event'}.` },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.7,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return { items: result.items || [] }
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

  static async buildEvent({ description, language = 'en' }: BuildEventParams): Promise<BuildEventResult> {
    const client = this.#getClient()

    const languageInstruction = language === 'en'
      ? 'Write entirely in English.'
      : 'Write entirely in Dutch (Nederlands).'

    const eventTypes = 'birthday, wedding, baby_shower, dinner, corporate, other'

    const systemPrompt = [
      'You are an intelligent event planning assistant for Fishionaire Events.',
      'The user will describe an event they want to plan in natural language.',
      'Extract and generate structured event details from their description.',
      languageInstruction,
      '',
      'Return a JSON object with these fields:',
      `- "eventType": one of [${eventTypes}], pick the best match`,
      '- "title": a catchy, creative event title based on the description',
      '- "description": a 2-3 sentence event description',
      '- "dateSuggestion": { "dayOfWeek": string, "timeOfDay": "morning"|"afternoon"|"evening"|"night", "suggestedTime": "HH:MM", "isoDate": "YYYY-MM-DDTHH:MM" } or null if no date info given. If the user mentions a specific date like "next Saturday" or "March 25", calculate the actual date relative to today (' + new Date().toISOString().split('T')[0] + ') and include it as "isoDate" in ISO 8601 format.',
      '- "activities": array of { "title": string, "durationMinutes": number }, suggest 3-5 relevant activities',
      '',
      'Be creative with the title and description. Make the activities realistic and well-timed.',
      'If the user mentions a specific date/time, extract it. Otherwise suggest a reasonable day and time.',
      'Only return valid JSON, nothing else.',
    ].join('\n')

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Plan an event based on this description: ${description}` },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 600,
        temperature: 0.8,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        eventType: result.eventType || 'other',
        title: result.title || '',
        description: result.description || '',
        dateSuggestion: result.dateSuggestion || null,
        activities: result.activities || [],
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
