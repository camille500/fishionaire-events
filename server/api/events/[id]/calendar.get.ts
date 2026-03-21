import { generateIcs } from '~/server/utils/icsGenerator'
import EventRepository from '~/server/repositories/eventRepository'
import SubEventRepository from '~/server/repositories/subEventRepository'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing event ID' })

  const query = getQuery(event)
  const subEventId = query.subEventId as string | undefined

  const eventEntity = await EventRepository.findById(id)
  if (!eventEntity) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  const icsEvents = []

  if (subEventId) {
    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent || subEvent.eventId !== id) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }
    if (subEvent.startTime) {
      icsEvents.push({
        title: `${eventEntity.title} — ${subEvent.title}`,
        description: subEvent.description,
        location: subEvent.location || eventEntity.location,
        startDate: new Date(subEvent.startTime),
        endDate: subEvent.endTime ? new Date(subEvent.endTime) : null,
      })
    }
  } else {
    if (eventEntity.eventDate) {
      icsEvents.push({
        title: eventEntity.title,
        description: eventEntity.description,
        location: eventEntity.location,
        startDate: new Date(eventEntity.eventDate),
        endDate: eventEntity.eventEndDate ? new Date(eventEntity.eventEndDate) : null,
      })
    }
  }

  if (icsEvents.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No date available for calendar export' })
  }

  const ics = generateIcs(icsEvents)

  setResponseHeaders(event, {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': `attachment; filename="${eventEntity.title.replace(/[^a-zA-Z0-9 ]/g, '')}.ics"`,
  })

  return ics
})
