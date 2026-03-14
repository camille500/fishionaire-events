import EventTemplate from '../entities/EventTemplate'
import EventTemplateRepository from '../repositories/eventTemplateRepository'
import EventRepository from '../repositories/eventRepository'
import SubEventRepository from '../repositories/subEventRepository'
import TimelineItemRepository from '../repositories/timelineItemRepository'

export default class EventTemplateController {
  static async listTemplates(clerkId: string): Promise<{
    system: Record<string, unknown>[]
    user: Record<string, unknown>[]
  }> {
    const [system, user] = await Promise.all([
      EventTemplateRepository.findSystemTemplates(),
      EventTemplateRepository.findByOwner(clerkId),
    ])

    return {
      system: system.map((t: EventTemplate) => t.toJSON()),
      user: user.map((t: EventTemplate) => t.toJSON()),
    }
  }

  static async saveAsTemplate(eventId: number, clerkId: string, name: string): Promise<Record<string, unknown>> {
    if (!name || !name.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Template name is required' })
    }

    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the owner can save an event as a template' })
    }

    const subEvents = await SubEventRepository.findByEventId(eventId)

    const template = new EventTemplate({
      name: name.trim(),
      description: event.description,
      eventType: event.eventType,
      settings: {
        maxGuests: event.maxGuests,
        isPrivate: event.isPrivate,
      },
      subEventTemplates: subEvents.map((se: { title: string, description: string | null }) => ({
        title: se.title,
        description: se.description,
      })),
      isSystem: false,
      ownerClerkId: clerkId,
    })

    const saved = await EventTemplateRepository.create(template)
    return saved.toJSON()
  }

  static async deleteTemplate(templateId: number, clerkId: string): Promise<void> {
    const template = await EventTemplateRepository.findById(templateId)
    if (!template) {
      throw createError({ statusCode: 404, statusMessage: 'Template not found' })
    }

    if (template.isSystem) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot delete system templates' })
    }

    if (template.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'You can only delete your own templates' })
    }

    await EventTemplateRepository.delete(templateId)
  }
}
