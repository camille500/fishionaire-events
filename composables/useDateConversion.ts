import { CalendarDate } from '@internationalized/date'

/**
 * Converts between datetime-local strings (used by form state)
 * and @internationalized/date CalendarDate (used by UCalendar).
 */
export function useDateConversion() {
  function stringToCalendarDate(str: string): CalendarDate | undefined {
    if (!str) return undefined
    const d = new Date(str)
    if (isNaN(d.getTime())) return undefined
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }

  function calendarDateToString(date: CalendarDate, hour: number, minute: number): string {
    const y = String(date.year).padStart(4, '0')
    const m = String(date.month).padStart(2, '0')
    const d = String(date.day).padStart(2, '0')
    const h = String(hour).padStart(2, '0')
    const min = String(minute).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}`
  }

  function parseTime(str: string): { hour: number, minute: number } {
    if (!str) return { hour: 12, minute: 0 }
    const d = new Date(str)
    if (isNaN(d.getTime())) return { hour: 12, minute: 0 }
    return { hour: d.getHours(), minute: d.getMinutes() }
  }

  function formatDateDisplay(str: string, locale: string): string {
    if (!str) return ''
    const d = new Date(str)
    if (isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  function stringToMinDate(str: string): CalendarDate | undefined {
    return stringToCalendarDate(str)
  }

  return {
    stringToCalendarDate,
    calendarDateToString,
    parseTime,
    formatDateDisplay,
    stringToMinDate,
  }
}
