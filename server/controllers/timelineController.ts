import TimelineItem from '../entities/TimelineItem'
import TimelineItemRepository from '../repositories/timelineItemRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'

interface AddItemParams {
  title: string
  description?: string | null
  location?: string | null
  startTime: string
  endTime?: string | null
}

interface UpdateItemParams {
  title?: string
  description?: string | null
  location?: string | null
  startTime?: string
  endTime?: string | null
}

export default class TimelineController {
  static async #verifyEditAccess(eventId: number, clerkId: string): Promise<Event> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (!event.features?.timeline) {
      throw createError({ statusCode: 403, statusMessage: 'Timeline is a Pro feature. Upgrade to access it.' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to edit this event' })
    }

    return event
  }

  static async getTimeline(eventId: number, clerkId: string): Promise<Record<string, unknown>[]> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const items = await TimelineItemRepository.findByEventId(eventId)
    return items.map((item: TimelineItem) => item.toJSON())
  }

  static async addItem(eventId: number, clerkId: string, { title, description, location, startTime, endTime }: AddItemParams): Promise<Record<string, unknown>> {
    await this.#verifyEditAccess(eventId, clerkId)

    if (!title || !title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    }

    if (!startTime) {
      throw createError({ statusCode: 400, statusMessage: 'Start time is required' })
    }

    const existing = await TimelineItemRepository.findByEventId(eventId)
    const sortOrder = existing.length

    const item = new TimelineItem({
      eventId,
      title: title.trim(),
      description: description || null,
      location: location || null,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      sortOrder,
    })

    const saved = await TimelineItemRepository.create(item)
    return saved.toJSON()
  }

  static async updateItem(itemId: number, clerkId: string, updates: UpdateItemParams): Promise<Record<string, unknown>> {
    const item = await TimelineItemRepository.findById(itemId)
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Timeline item not found' })
    }

    await this.#verifyEditAccess(item.eventId, clerkId)

    if (updates.title !== undefined) {
      if (!updates.title || !updates.title.trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Title is required' })
      }
      item.title = updates.title.trim()
    }
    if (updates.description !== undefined) item.description = updates.description || null
    if (updates.location !== undefined) item.location = updates.location || null
    if (updates.startTime !== undefined) item.startTime = new Date(updates.startTime)
    if (updates.endTime !== undefined) item.endTime = updates.endTime ? new Date(updates.endTime) : null

    const saved = await TimelineItemRepository.update(item)
    return saved.toJSON()
  }

  static async deleteItem(itemId: number, clerkId: string): Promise<void> {
    const item = await TimelineItemRepository.findById(itemId)
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Timeline item not found' })
    }

    await this.#verifyEditAccess(item.eventId, clerkId)
    await TimelineItemRepository.delete(itemId)
  }

  static async reorderTimeline(eventId: number, clerkId: string, orderedIds: number[]): Promise<Record<string, unknown>[]> {
    await this.#verifyEditAccess(eventId, clerkId)

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Ordered IDs array is required' })
    }

    await TimelineItemRepository.reorder(eventId, orderedIds)
    return (await TimelineItemRepository.findByEventId(eventId)).map((item: TimelineItem) => item.toJSON())
  }
}
