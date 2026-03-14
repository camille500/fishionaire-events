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

  return {
    parseNaturalDate,
    dateToLocalString,
    formatPreview,
    parseWithPreview,
  }
}
