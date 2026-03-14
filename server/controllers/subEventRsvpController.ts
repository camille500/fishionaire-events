import SubEventRepository from '../repositories/subEventRepository'
import SubEventRsvpRepository from '../repositories/subEventRsvpRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'

type RsvpStatus = 'accepted' | 'declined'

interface RsvpCounts {
  accepted: number
  declined: number
}

export default class SubEventRsvpController {
  static async rsvpToSubEvent(eventId: number, subEventId: number, guestEmail: string, status: RsvpStatus): Promise<Record<string, unknown>> {
    if (!['accepted', 'declined'].includes(status)) {
      throw createError({ statusCode: 400, statusMessage: 'Status must be accepted or declined' })
    }

    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent || subEvent.eventId !== eventId) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    // Verify guest is invited to the parent event
    const invitation = await EventInvitationRepository.findByEventIdAndEmail(eventId, guestEmail.toLowerCase())
    if (!invitation) {
      throw createError({ statusCode: 403, statusMessage: 'You are not invited to this event' })
    }

    const rsvp = await SubEventRsvpRepository.upsert(subEventId, guestEmail.toLowerCase(), status)
    return rsvp.toJSON()
  }

  static async getSubEventRsvps(eventId: number, subEventId: number, clerkId: string): Promise<{ rsvps: Record<string, unknown>[], counts: RsvpCounts }> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'Only organizers can view RSVPs' })
    }

    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent || subEvent.eventId !== eventId) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    const rsvps = await SubEventRsvpRepository.findBySubEventId(subEventId)
    const counts = await SubEventRsvpRepository.getCountsBySubEventId(subEventId)
    return { rsvps: rsvps.map((r: any) => r.toJSON()), counts }
  }

  static async getMyRsvps(eventId: number, email: string): Promise<Record<string, unknown>[]> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    return SubEventRsvpRepository.findByEventIdAndEmail(eventId, email.toLowerCase())
  }
}
