import OpenAI from 'openai'

export default class AiSuggestionsController {
  static #getClient() {
    const config = useRuntimeConfig()
    if (!config.openaiApiKey) {
      throw createError({ statusCode: 502, statusMessage: 'AI service is not configured' })
    }
    return new OpenAI({ apiKey: config.openaiApiKey })
  }

  static async suggestTitles({ eventType, context, language = 'en' }) {
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

      const result = JSON.parse(response.choices[0].message.content)
      return { suggestions: result.suggestions || [] }
    } catch (err) {
      if (err.status === 401) {
        throw createError({ statusCode: 502, statusMessage: 'AI service configuration error' })
      }
      if (err.status === 429) {
        throw createError({ statusCode: 429, statusMessage: 'AI service is busy, please try again later' })
      }
      throw createError({ statusCode: 502, statusMessage: 'AI service unavailable' })
    }
  }

  static async suggestSubEvents({ eventType, eventTitle, existingSubEvents = [], language = 'en' }) {
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
      existingContext,
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

      const result = JSON.parse(response.choices[0].message.content)
      return { suggestions: result.suggestions || [] }
    } catch (err) {
      if (err.status === 401) {
        throw createError({ statusCode: 502, statusMessage: 'AI service configuration error' })
      }
      if (err.status === 429) {
        throw createError({ statusCode: 429, statusMessage: 'AI service is busy, please try again later' })
      }
      throw createError({ statusCode: 502, statusMessage: 'AI service unavailable' })
    }
  }

  static async suggestTimeline({ eventType, eventDate, subEvents = [], language = 'en' }) {
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

      const result = JSON.parse(response.choices[0].message.content)
      return { items: result.items || [] }
    } catch (err) {
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
