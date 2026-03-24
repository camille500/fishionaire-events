import SubEventRepository from '../repositories/subEventRepository'
import SubEventRsvpRepository from '../repositories/subEventRsvpRepository'
import SubEventDietaryRepository from '../repositories/subEventDietaryRepository'
import SubEventPlusOneRepository from '../repositories/subEventPlusOneRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import ActivityLogController from './activityLogController'
import NotificationController from './notificationController'

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

    // Check RSVP enabled and deadline
    const event = await EventRepository.findById(eventId)
    if (event) {
      if (!event.rsvpEnabled) {
        throw createError({ statusCode: 403, statusMessage: 'RSVP is disabled for this event' })
      }
      if (event.rsvpDeadline && new Date() > new Date(event.rsvpDeadline)) {
        throw createError({ statusCode: 400, statusMessage: 'RSVP deadline has passed' })
      }
    }

    // Verify guest is invited to the parent event
    const invitation = await EventInvitationRepository.findByEventIdAndEmail(eventId, guestEmail.toLowerCase())
    if (!invitation) {
      throw createError({ statusCode: 403, statusMessage: 'You are not invited to this event' })
    }

    const rsvp = await SubEventRsvpRepository.upsert(subEventId, guestEmail.toLowerCase(), status)

    ActivityLogController.log(eventId, 'rsvp', invitation.inviteeName || guestEmail, guestEmail, {
      subEventTitle: subEvent.title,
      status,
    })

    NotificationController.notify({
      eventId,
      type: 'rsvp_update',
      title: `${invitation.inviteeName || guestEmail} ${status} the RSVP`,
      body: `${invitation.inviteeName || guestEmail} ${status} the RSVP for ${subEvent.title}`,
      linkUrl: `/dashboard/events/${eventId}`,
      metadata: { subEventTitle: subEvent.title, status },
      recipientRole: 'all_organizers',
      eventTier: event?.tier,
    })

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

  static async getRsvpOverview(eventId: number, clerkId: string): Promise<Record<string, unknown>> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'Only organizers can view RSVP overview' })
    }

    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const [subEvents, invitations, rsvps, rsvpCounts] = await Promise.all([
      SubEventRepository.findByEventId(eventId),
      EventInvitationRepository.findByEventId(eventId),
      SubEventRsvpRepository.findAllByEventId(eventId),
      SubEventRsvpRepository.getCountsByEventId(eventId),
    ])

    const accepted = invitations.filter((inv) => inv.isAccepted).length
    const declined = invitations.filter((inv) => inv.isDeclined).length
    const pending = invitations.filter((inv) => inv.isPending).length

    // Build per-sub-event breakdown
    const subEventOverview = subEvents.map((se) => {
      const seId = Number(se.id)
      const counts = rsvpCounts[seId] || { accepted: 0, declined: 0, pending: 0 }
      const seRsvps = rsvps
        .filter((r) => Number(r.subEventId) === seId)
        .map((r) => r.toJSON())
      return {
        id: se.id,
        title: se.title,
        counts,
        rsvps: seRsvps,
      }
    })

    return {
      event: {
        id: event.id,
        title: event.title,
        rsvpEnabled: event.rsvpEnabled,
        rsvpDeadline: event.rsvpDeadline,
      },
      totalInvited: invitations.length,
      overall: { accepted, declined, pending },
      subEvents: subEventOverview,
      invitations: invitations.map((inv) => ({
        inviteeName: inv.inviteeName,
        inviteeEmail: inv.inviteeEmail,
        status: inv.status,
      })),
    }
  }

  static async exportGuestListCsv(eventId: number, clerkId: string): Promise<string> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'Only organizers can export guest list' })
    }

    const [subEvents, invitations, rsvps, dietaryEntries, plusOnes] = await Promise.all([
      SubEventRepository.findByEventId(eventId),
      EventInvitationRepository.findByEventId(eventId),
      SubEventRsvpRepository.findAllByEventId(eventId),
      SubEventDietaryRepository.findAllByEventId(eventId),
      SubEventPlusOneRepository.findAllByEventId(eventId),
    ])

    // Build RSVP lookup: guestEmail -> subEventId -> status
    const rsvpMap = new Map<string, Map<string, string>>()
    for (const rsvp of rsvps) {
      const json = rsvp.toJSON()
      if (!rsvpMap.has(json.guestEmail as string)) {
        rsvpMap.set(json.guestEmail as string, new Map())
      }
      rsvpMap.get(json.guestEmail as string)!.set(String(json.subEventId), json.status as string)
    }

    // Build dietary lookup: guestEmail -> restrictions
    const dietaryMap = new Map<string, string>()
    for (const d of dietaryEntries) {
      const json = d.toJSON()
      const parts = [json.restrictions]
      if (json.notes) parts.push(json.notes as string)
      dietaryMap.set(json.guestEmail as string, parts.join(' - '))
    }

    // Build plus-one lookup: guestEmail -> count
    const plusOneMap = new Map<string, number>()
    for (const p of plusOnes) {
      const json = p.toJSON()
      const email = json.guestEmail as string
      plusOneMap.set(email, (plusOneMap.get(email) || 0) + 1)
    }

    const escapeCsv = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return '"' + value.replace(/"/g, '""') + '"'
      }
      return value
    }

    // Build CSV header
    const subEventTitles = subEvents.map((se) => se.title)
    const headers = ['Name', 'Email', 'Status', ...subEventTitles, 'Dietary', 'Plus-Ones']
    const lines = [headers.map(escapeCsv).join(',')]

    // Build rows
    for (const inv of invitations) {
      const json = inv.toJSON()
      const email = (json.inviteeEmail as string) || ''
      const name = (json.inviteeName as string) || ''
      const status = (json.status as string) || 'pending'

      const subEventStatuses = subEvents.map((se) => {
        const guestRsvps = rsvpMap.get(email)
        return guestRsvps?.get(String(se.id)) || 'no response'
      })

      const dietary = dietaryMap.get(email) || ''
      const plusOneCount = plusOneMap.get(email) || 0

      const row = [
        name,
        email,
        status,
        ...subEventStatuses,
        dietary,
        String(plusOneCount),
      ]
      lines.push(row.map(escapeCsv).join(','))
    }

    return lines.join('\n')
  }
}
