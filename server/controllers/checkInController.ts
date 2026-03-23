import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import ActivityLogController from './activityLogController'

export default class CheckInController {
  static async #verifyOrganizerAccess(eventId: number, clerkId: string) {
    const event = await EventRepository.findById(eventId as any)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }
    const member = await EventMemberRepository.findByEventIdAndUserId(String(eventId), clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to manage this event' })
    }
    return event
  }

  static #checkFeature(event: any) {
    if (!event.features?.checkIn) {
      throw createError({ statusCode: 403, statusMessage: 'Check-in is not available for this event tier' })
    }
  }

  static async checkInByToken(eventId: number, accessToken: string, clerkId: string) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkFeature(event)

    const invitation = await EventInvitationRepository.findByAccessToken(accessToken)
    if (!invitation) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
    }
    if (Number(invitation.eventId) !== eventId) {
      throw createError({ statusCode: 400, statusMessage: 'Invitation does not belong to this event' })
    }
    if (invitation.status !== 'accepted') {
      throw createError({ statusCode: 400, statusMessage: 'Guest has not accepted their invitation' })
    }
    if (invitation.isCheckedIn) {
      throw createError({ statusCode: 409, statusMessage: 'Guest is already checked in' })
    }

    const updated = await EventInvitationRepository.update(Number(invitation.id), {
      checkedInAt: new Date(),
    })

    const name = invitation.inviteeName || invitation.inviteeEmail
    ActivityLogController.log(eventId, 'check_in', name, invitation.inviteeEmail, {
      guestName: name,
    })

    return updated.toJSON()
  }

  static async undoCheckIn(eventId: number, invitationId: number, clerkId: string) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkFeature(event)

    const invitation = await EventInvitationRepository.findById(invitationId)
    if (!invitation) {
      throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }
    if (Number(invitation.eventId) !== eventId) {
      throw createError({ statusCode: 400, statusMessage: 'Invitation does not belong to this event' })
    }

    const updated = await EventInvitationRepository.update(invitationId, {
      checkedInAt: null,
    })
    return updated.toJSON()
  }

  static async getStats(eventId: number, clerkId: string) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkFeature(event)
    return EventInvitationRepository.getCheckInStats(String(eventId))
  }

  static async getCheckedInGuests(eventId: number, clerkId: string) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkFeature(event)
    const guests = await EventInvitationRepository.findCheckedInByEventId(String(eventId))
    return guests.map((g) => g.toJSON())
  }
}
