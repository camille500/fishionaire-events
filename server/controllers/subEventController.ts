import SubEvent from '../entities/SubEvent'
import SubEventRepository from '../repositories/subEventRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'

export default class SubEventController {
  static async #verifyAccess(eventId, clerkId, email, requireEdit = false) {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (member) {
      if (requireEdit && !member.canEdit) {
        throw createError({ statusCode: 403, statusMessage: 'You do not have permission to edit this event' })
      }
      return event
    }

    if (!requireEdit) {
      const invitation = await EventInvitationRepository.findByEventIdAndEmail(eventId, email?.toLowerCase())
      if (invitation) return event
    }

    throw createError({ statusCode: 403, statusMessage: 'You do not have access to this event' })
  }

  static async listSubEvents(eventId, clerkId, email) {
    await this.#verifyAccess(eventId, clerkId, email)
    return (await SubEventRepository.findByEventId(eventId)).map((se) => se.toJSON())
  }

  static async createSubEvent(eventId, clerkId, { title, description, startTime, endTime, location }) {
    await this.#verifyAccess(eventId, clerkId, null, true)

    if (!title || !title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    }

    const existing = await SubEventRepository.findByEventId(eventId)
    const sortOrder = existing.length

    const subEvent = new SubEvent({
      eventId,
      title: title.trim(),
      description: description || null,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      location: location || null,
      sortOrder,
    })

    const saved = await SubEventRepository.create(subEvent)
    return saved.toJSON()
  }

  static async updateSubEvent(subEventId, clerkId, updates) {
    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    await this.#verifyAccess(subEvent.eventId, clerkId, null, true)

    if (updates.title !== undefined) {
      if (!updates.title || !updates.title.trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Title is required' })
      }
      subEvent.title = updates.title.trim()
    }
    if (updates.description !== undefined) subEvent.description = updates.description || null
    if (updates.startTime !== undefined) subEvent.startTime = updates.startTime ? new Date(updates.startTime) : null
    if (updates.endTime !== undefined) subEvent.endTime = updates.endTime ? new Date(updates.endTime) : null
    if (updates.location !== undefined) subEvent.location = updates.location || null

    const saved = await SubEventRepository.update(subEvent)
    return saved.toJSON()
  }

  static async deleteSubEvent(subEventId, clerkId) {
    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    await this.#verifyAccess(subEvent.eventId, clerkId, null, true)
    await SubEventRepository.delete(subEventId)
  }

  static async reorderSubEvents(eventId, clerkId, orderedIds) {
    await this.#verifyAccess(eventId, clerkId, null, true)

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Ordered IDs array is required' })
    }

    await SubEventRepository.reorder(eventId, orderedIds)
    return (await SubEventRepository.findByEventId(eventId)).map((se) => se.toJSON())
  }
}
