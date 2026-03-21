function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

interface IcsEvent {
  title: string
  description?: string | null
  location?: string | null
  startDate: Date
  endDate?: Date | null
  url?: string | null
}

export function generateIcs(events: IcsEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fishionaire Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const event of events) {
    const start = formatIcsDate(event.startDate)
    const end = event.endDate
      ? formatIcsDate(event.endDate)
      : formatIcsDate(new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000))

    lines.push('BEGIN:VEVENT')
    lines.push(`DTSTART:${start}`)
    lines.push(`DTEND:${end}`)
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`)
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`)
    }
    if (event.url) {
      lines.push(`URL:${event.url}`)
    }
    lines.push(`UID:${Date.now()}-${Math.random().toString(36).slice(2)}@fishionaire.com`)
    lines.push(`DTSTAMP:${formatIcsDate(new Date())}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function buildGoogleCalendarUrl(event: IcsEvent): string {
  const start = formatIcsDate(event.startDate)
  const end = event.endDate
    ? formatIcsDate(event.endDate)
    : formatIcsDate(new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000))

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
  })

  if (event.description) params.set('details', event.description)
  if (event.location) params.set('location', event.location)

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
