import * as chronoEn from 'chrono-node/en'
import * as chronoNl from 'chrono-node/nl'

/**
 * Natural language date parsing powered by chrono-node.
 * Supports English and Dutch locales.
 */
export function useNaturalDateParse() {
  const { locale } = useI18n()

  function getParser() {
    return locale.value === 'nl' ? chronoNl : chronoEn
  }

  /**
   * Parse natural language text into a Date object.
   * Examples: "next Saturday at 3pm", "volgende zaterdag 15:00", "tomorrow 18:30"
   */
  function parseNaturalDate(text: string): Date | null {
    if (!text.trim()) return null
    try {
      const result = getParser().parseDate(text, new Date(), { forwardDate: true })
      return result || null
    } catch {
      return null
    }
  }

  /**
   * Convert a Date to a datetime-local format string (YYYY-MM-DDTHH:mm)
   * Compatible with the form state used throughout the app.
   */
  function dateToLocalString(date: Date): string {
    const y = String(date.getFullYear()).padStart(4, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}`
  }

  /**
   * Format a Date as a human-readable preview string.
   * e.g. "Saturday, March 21, 2026 at 15:00"
   */
  function formatPreview(date: Date): string {
    return new Intl.DateTimeFormat(locale.value, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  /**
   * Parse text and return both the formatted preview and datetime-local string,
   * or null if parsing fails.
   */
  function parseWithPreview(text: string): { date: Date, preview: string, localString: string } | null {
    const date = parseNaturalDate(text)
    if (!date) return null
    return {
      date,
      preview: formatPreview(date),
      localString: dateToLocalString(date),
    }
  }

  /**
   * Parse text that may contain multiple dates.
   * Uses chrono-node's parse() which returns an array of results.
   * Falls back to splitting on commas/and/en and parsing each segment.
   * Examples: "March 28, 29 and April 4", "28, 29 maart en 4 april"
   */
  /**
   * Expand a date range (start → end) into individual day entries,
   * preserving the time from the start date on each day.
   */
  function expandRange(start: Date, end: Date): Date[] {
    const dates: Date[] = []
    const current = new Date(start)
    // Cap at 31 days to prevent runaway loops
    const maxDays = 31
    let count = 0
    while (current <= end && count < maxDays) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
      count++
    }
    return dates
  }

  /**
   * Normalize Dutch range expressions so chrono-node recognizes them.
   * chrono-node NL only understands "tot" and "-" as range connectors,
   * so we convert "tot en met", "t/m", "t.e.m." to "tot".
   */
  function normalizeDutchRange(text: string): string {
    if (locale.value !== 'nl') return text
    return text
      .replace(/\bt\/m\b/gi, 'tot')
      .replace(/\bt\.e\.m\.?\b/gi, 'tot')
      .replace(/\btot\s+en\s+met\b/gi, 'tot')
  }

  function parseMultiple(text: string): Array<{ date: Date, preview: string, localString: string }> {
    if (!text.trim()) return []

    try {
      const normalized = normalizeDutchRange(text)
      const results = getParser().parse(normalized, new Date(), { forwardDate: true })

      // Check for date ranges (e.g. "between May 5 and May 8", "5 tot 8 mei")
      // chrono-node sets result.end when it detects a range
      if (results.length === 1 && results[0] && results[0].end) {
        const start = results[0].start.date()
        const end = results[0].end.date()
        if (end > start) {
          const expanded = expandRange(start, end)
          return expanded.map(date => ({
            date,
            preview: formatPreview(date),
            localString: dateToLocalString(date),
          }))
        }
      }

      if (results.length > 1) {
        const all: Array<{ date: Date, preview: string, localString: string }> = []
        for (const r of results) {
          if (r.end) {
            // This result is itself a range — expand it
            const expanded = expandRange(r.start.date(), r.end.date())
            for (const date of expanded) {
              all.push({ date, preview: formatPreview(date), localString: dateToLocalString(date) })
            }
          } else {
            const date = r.start.date()
            all.push({ date, preview: formatPreview(date), localString: dateToLocalString(date) })
          }
        }
        return all
      }

      // If chrono only found 0-1 results, try splitting on separators
      const separators = locale.value === 'nl'
        ? /[,;]\s*|\s+en\s+/gi
        : /[,;]\s*|\s+and\s+/gi

      const segments = normalized.split(separators).map(s => s.trim()).filter(Boolean)

      if (segments.length > 1) {
        const parsed: Array<{ date: Date, preview: string, localString: string }> = []
        for (const segment of segments) {
          const date = getParser().parseDate(segment, new Date(), { forwardDate: true })
          if (date) {
            parsed.push({
              date,
              preview: formatPreview(date),
              localString: dateToLocalString(date),
            })
          }
        }
        if (parsed.length > 0) return parsed
      }

      // Fall back to single parse
      if (results.length === 1 && results[0]) {
        const date = results[0].start.date()
        return [{
          date,
          preview: formatPreview(date),
          localString: dateToLocalString(date),
        }]
      }

      return []
    } catch {
      return []
    }
  }

  return {
    parseNaturalDate,
    dateToLocalString,
    formatPreview,
    parseWithPreview,
    parseMultiple,
  }
}
