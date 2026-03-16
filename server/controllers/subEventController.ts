import SubEvent from '../entities/SubEvent'
import type { SubEventTypeValue } from '../entities/SubEvent'
import SubEventRepository from '../repositories/subEventRepository'
import SubEventDietaryRepository from '../repositories/subEventDietaryRepository'
import SubEventPlusOneRepository from '../repositories/subEventPlusOneRepository'
import SubEventMusicRequestRepository from '../repositories/subEventMusicRequestRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'

interface CreateSubEventParams {
  title: string
  description?: string | null
  type?: SubEventTypeValue
  richContent?: string | null
  capacity?: number | null
  dressCode?: string | null
  typeConfig?: Record<string, unknown>
  startTime?: string | null
  endTime?: string | null
  location?: string | null
}

interface UpdateSubEventParams {
  title?: string
  description?: string | null
  type?: SubEventTypeValue
  richContent?: string | null
  coverImageUrl?: string | null
  coverImageKey?: string | null
  capacity?: number | null
  dressCode?: string | null
  typeConfig?: Record<string, unknown>
  startTime?: string | null
  endTime?: string | null
  location?: string | null
}

export default class SubEventController {
  static async #verifyAccess(eventId: number, clerkId: string, email: string | null, requireEdit: boolean = false): Promise<Event> {
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

  static async listSubEvents(eventId: number, clerkId: string, email: string): Promise<Record<string, unknown>[]> {
    await this.#verifyAccess(eventId, clerkId, email)
    return (await SubEventRepository.findByEventId(eventId)).map((se: SubEvent) => se.toJSON())
  }

  static async createSubEvent(eventId: number, clerkId: string, params: CreateSubEventParams): Promise<Record<string, unknown>> {
    await this.#verifyAccess(eventId, clerkId, null, true)

    if (!params.title || !params.title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    }

    const existing = await SubEventRepository.findByEventId(eventId)
    const sortOrder = existing.length

    const subEvent = new SubEvent({
      id: null,
      eventId,
      title: params.title.trim(),
      description: params.description || null,
      type: params.type || 'generic',
      richContent: params.richContent || null,
      coverImageUrl: null,
      coverImageKey: null,
      capacity: params.capacity ?? null,
      dressCode: params.dressCode || null,
      typeConfig: params.typeConfig || {},
      startTime: params.startTime ? new Date(params.startTime) : null,
      endTime: params.endTime ? new Date(params.endTime) : null,
      location: params.location || null,
      sortOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const saved = await SubEventRepository.create(subEvent)
    return saved.toJSON()
  }

  static async updateSubEvent(subEventId: number, clerkId: string, updates: UpdateSubEventParams): Promise<Record<string, unknown>> {
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
    if (updates.type !== undefined) subEvent.type = updates.type
    if (updates.richContent !== undefined) subEvent.richContent = updates.richContent || null
    if (updates.coverImageUrl !== undefined) subEvent.coverImageUrl = updates.coverImageUrl || null
    if (updates.coverImageKey !== undefined) subEvent.coverImageKey = updates.coverImageKey || null
    if (updates.capacity !== undefined) subEvent.capacity = updates.capacity
    if (updates.dressCode !== undefined) subEvent.dressCode = updates.dressCode || null
    if (updates.typeConfig !== undefined) subEvent.typeConfig = updates.typeConfig || {}
    if (updates.startTime !== undefined) subEvent.startTime = updates.startTime ? new Date(updates.startTime) : null
    if (updates.endTime !== undefined) subEvent.endTime = updates.endTime ? new Date(updates.endTime) : null
    if (updates.location !== undefined) subEvent.location = updates.location || null

    const saved = await SubEventRepository.update(subEvent)
    return saved.toJSON()
  }

  static async updateTypeConfig(subEventId: number, clerkId: string, typeConfig: Record<string, unknown>): Promise<Record<string, unknown>> {
    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    await this.#verifyAccess(subEvent.eventId, clerkId, null, true)
    subEvent.typeConfig = { ...subEvent.typeConfig, ...typeConfig }

    const saved = await SubEventRepository.update(subEvent)
    return saved.toJSON()
  }

  static async getSubEventDetail(subEventId: number, clerkId: string, email: string | null): Promise<Record<string, unknown>> {
    const result = await SubEventRepository.findByIdWithCounts(subEventId)
    if (!result) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    await this.#verifyAccess(result.subEvent.eventId, clerkId, email)

    const detail: Record<string, unknown> = {
      ...result.subEvent.toJSON(),
      rsvpCount: result.rsvpCount,
      dietaryCount: result.dietaryCount,
      plusOneCount: result.plusOneCount,
      musicRequestCount: result.musicRequestCount,
    }

    // Include type-specific data for organizers
    const member = await EventMemberRepository.findByEventIdAndUserId(result.subEvent.eventId, clerkId)
    if (member?.canEdit) {
      if (result.subEvent.type === 'dinner') {
        const dietaryResponses = await SubEventDietaryRepository.findBySubEventId(subEventId)
        detail.dietaryResponses = dietaryResponses.map((d) => d.toJSON())
      }
      if (result.subEvent.type === 'party') {
        const plusOnes = await SubEventPlusOneRepository.findBySubEventId(subEventId)
        detail.plusOneRequests = plusOnes.map((p) => p.toJSON())
        const musicRequests = await SubEventMusicRequestRepository.findBySubEventId(subEventId)
        detail.musicRequests = musicRequests.map((m) => m.toJSON())
      }
    }

    return detail
  }

  static async deleteSubEvent(subEventId: number, clerkId: string): Promise<void> {
    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    await this.#verifyAccess(subEvent.eventId, clerkId, null, true)
    await SubEventRepository.delete(subEventId)
  }

  static async reorderSubEvents(eventId: number, clerkId: string, orderedIds: number[]): Promise<Record<string, unknown>[]> {
    await this.#verifyAccess(eventId, clerkId, null, true)

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Ordered IDs array is required' })
    }

    await SubEventRepository.reorder(eventId, orderedIds)
    return (await SubEventRepository.findByEventId(eventId)).map((se: SubEvent) => se.toJSON())
  }
}
