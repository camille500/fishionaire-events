import OpenAI from 'openai'
import { AI_MODEL } from '../utils/aiConfig'

interface SuggestedDate {
  date: string
  startTime?: string | null
  endTime?: string | null
}

export default class AiDateController {
  static async suggestDates(
    prompt: string,
    language: string = 'nl',
  ): Promise<{ dates: SuggestedDate[] }> {
    if (!prompt || !prompt.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'A prompt is required' })
    }

    const config = useRuntimeConfig()
    if (!config.openaiApiKey) {
      throw createError({ statusCode: 503, statusMessage: 'AI service not configured' })
    }

    const openai = new OpenAI({ apiKey: config.openaiApiKey })
    const today = new Date().toISOString().split('T')[0]

    const systemPrompt = `You are a date suggestion assistant. Given a natural language description of dates, return a JSON object with a "dates" array. Each item has:
- "date": ISO 8601 date string (YYYY-MM-DD)
- "startTime": optional time string (HH:mm) or null
- "endTime": optional time string (HH:mm) or null

Rules:
- Today is ${today}. Only return future dates (on or after today).
- Handle patterns like "every Sunday in March", "first weekend of each month in Q2", "every other Saturday in April", "weekdays next week".
- If the user mentions times (e.g. "from 14:00 to 18:00"), include them.
- Return at most 20 dates.
- Return ONLY valid JSON, no explanation.
- The user may write in ${language === 'nl' ? 'Dutch' : 'English'}.`

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt.trim() },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw createError({ statusCode: 500, statusMessage: 'AI returned empty response' })
    }

    let parsed: { dates?: SuggestedDate[] }
    try {
      parsed = JSON.parse(content)
    } catch {
      throw createError({ statusCode: 500, statusMessage: 'AI returned invalid JSON' })
    }

    if (!Array.isArray(parsed.dates)) {
      return { dates: [] }
    }

    // Validate dates
    const validDates = parsed.dates.filter((d) => {
      if (!d.date || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return false
      const dateObj = new Date(d.date + 'T00:00:00')
      if (isNaN(dateObj.getTime())) return false
      if (d.date < today) return false
      return true
    }).slice(0, 20)

    return { dates: validDates, tokensUsed: response.usage?.total_tokens ?? 0 }
  }
}
