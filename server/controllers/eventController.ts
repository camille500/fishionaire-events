import crypto from 'crypto'
import Event from '../entities/Event'
import EventInvitation from '../entities/EventInvitation'
import EventMember from '../entities/EventMember'
import EventRepository from '../repositories/eventRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import SubEventRepository from '../repositories/subEventRepository'
import SubEventRsvpRepository from '../repositories/subEventRsvpRepository'
import TimelineItemRepository from '../repositories/timelineItemRepository'
import SubscriptionController from './subscriptionController'
import { getFeaturesForTier } from '../utils/tierFeatures'
import { uploadImage, deleteImage } from '../utils/s3'
import { sendEmail } from '../utils/email'
import { renderInviteEmail } from '../utils/emailTemplates'

type EventType = 'birthday' | 'wedding' | 'baby_shower' | 'dinner' | 'corporate' | 'other'
type Tier = 'free' | 'standard' | 'pro'

interface WizardData {
  eventType?: EventType
  eventDate?: string
  location?: string
  description?: string
  coverImageUrl?: string
  coverImageKey?: string
  subEvents?: Array<{ title: string }>
}

interface UpdateEventParams {
  title?: string
  description?: string | null
  eventType?: EventType | null
  eventDate?: string | null
  eventEndDate?: string | null
  location?: string | null
  locationLat?: number | null
  locationLon?: number | null
  isPrivate?: boolean
  rsvpEnabled?: boolean
  rsvpDeadline?: string | null
  features?: Record<string, boolean>
}

export default class EventController {
  static async listUserEvents(clerkId: string, email: string): Promise<{
    owned: Record<string, unknown>[]
    coOrganizing: Record<string, unknown>[]
    invited: Record<string, unknown>[]
    archived: Record<string, unknown>[]
  }> {
    const ownedEvents = await EventRepository.findByOwner(clerkId)
    const invitedResults = await EventRepository.findByInviteeEmail(email.toLowerCase())
    const coOrgResults = await EventMemberRepository.findCoOrganizedEvents(clerkId)

    const owned = await Promise.all(
      ownedEvents.map(async (event: Event) => {
        const invitationCount = await EventRepository.getInvitationCount(event.id)
        return { ...event.toJSON(), invitationCount }
      })
    )

    const invited = invitedResults.map(({ event, status }: { event: Event, status: string }) => ({
      ...event.toJSON(),
      status,
    }))

    const coOrganizing = await Promise.all(
      coOrgResults.map(async ({ event }: { event: Record<string, unknown> }) => {
        const e = Event.fromJSON(event)
        const invitationCount = await EventRepository.getInvitationCount(e.id)
        return { ...e.toJSON(), invitationCount }
      })
    )

    const archivedEvents = await EventRepository.findArchivedByOwner(clerkId)
    const archived = archivedEvents.map((event: Event) => event.toJSON())

    return { owned, coOrganizing, invited, archived }
  }

  static async createEvent(
    clerkId: string,
    title: string,
    requestedTier: Tier = 'free',
    templateId: number | null = null,
    wizardData: WizardData = {}
  ): Promise<Record<string, unknown>> {
    if (!title || !title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    }

    const { tier, requiresPayment, priceCents } = await SubscriptionController.resolveEventTier(clerkId, requestedTier)

    let templateData: Record<string, unknown> = {}
    if (templateId) {
      const { default: EventTemplateRepository } = await import('../repositories/eventTemplateRepository')
      const template = await EventTemplateRepository.findById(templateId)
      if (template) {
        templateData = {
          description: template.description,
          eventType: template.eventType,
          ...(template.settings || {}),
        }
      }
    }

    const event = new Event({
      title: title.trim(),
      tier,
      features: getFeaturesForTier(tier),
      ownerClerkId: clerkId,
      shareToken: crypto.randomBytes(16).toString('hex'),
      ...templateData,
      ...(wizardData.eventType ? { eventType: wizardData.eventType } : {}),
      ...(wizardData.eventDate ? { eventDate: new Date(wizardData.eventDate) } : {}),
      ...(wizardData.location ? { location: wizardData.location } : {}),
      ...(wizardData.description ? { description: wizardData.description } : {}),
      ...(wizardData.coverImageUrl ? { coverImageUrl: wizardData.coverImageUrl } : {}),
      ...(wizardData.coverImageKey ? { coverImageKey: wizardData.coverImageKey } : {}),
    })

    const saved = await EventRepository.create(event)

    // Seed owner as EventMember
    const ownerMember = new EventMember({
      eventId: saved.id,
      userClerkId: clerkId,
      role: 'owner',
    })
    await EventMemberRepository.create(ownerMember)

    // Create sub-events from wizard data (if no template was used)
    if (!templateId && wizardData.subEvents?.length > 0) {
      await SubEventRepository.bulkCreate(
        wizardData.subEvents.map((se, index) => ({
          eventId: saved.id,
          title: se.title,
          description: null,
          sortOrder: index,
        }))
      )
    }

    // If created from template, create sub-events
    if (templateId) {
      const { default: EventTemplateRepository } = await import('../repositories/eventTemplateRepository')
      const template = await EventTemplateRepository.findById(templateId)
      if (template && template.subEventTemplates?.length > 0) {
        const SubEvent = (await import('../entities/SubEvent')).default
        await SubEventRepository.bulkCreate(
          template.subEventTemplates.map((st: { title: string, description?: string | null }, index: number) => ({
            eventId: saved.id,
            title: st.title,
            description: st.description || null,
            sortOrder: index,
          }))
        )
      }
    }

    return { ...saved.toJSON(), requiresPayment, priceCents }
  }

  static async getEvent(eventId: number, clerkId: string, email: string): Promise<Record<string, unknown>> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    // Check membership for role
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (member) {
      return { ...event.toJSON(), role: member.role, isOwner: member.isOwner }
    }

    // Check invitation
    const invitation = await EventInvitationRepository.findByEventIdAndEmail(eventId, email.toLowerCase())
    if (invitation) {
      return { ...event.toJSON(), role: 'guest', isOwner: false }
    }

    throw createError({ statusCode: 403, statusMessage: 'You do not have access to this event' })
  }

  static async updateEvent(eventId: number, clerkId: string, {
    title, description, eventType, eventDate, eventEndDate, location, locationLat, locationLon, isPrivate, rsvpEnabled, rsvpDeadline, features
  }: UpdateEventParams): Promise<Record<string, unknown>> {
    const validEventTypes: EventType[] = ['birthday', 'wedding', 'baby_shower', 'dinner', 'corporate', 'other']

    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    // Allow owner or co-organizer
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to edit this event' })
    }

    if (title !== undefined) {
      if (!title || !title.trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Title is required' })
      }
      event.title = title.trim()
    }

    if (description !== undefined) {
      event.description = description
    }

    if (eventType !== undefined) {
      if (eventType !== null && !validEventTypes.includes(eventType)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid event type' })
      }
      event.eventType = eventType
    }

    if (eventDate !== undefined) {
      event.eventDate = eventDate ? new Date(eventDate) : null
    }

    if (eventEndDate !== undefined) {
      event.eventEndDate = eventEndDate ? new Date(eventEndDate) : null
    }

    if (location !== undefined) {
      event.location = location || null
    }

    if (locationLat !== undefined) {
      event.locationLat = locationLat ?? null
    }

    if (locationLon !== undefined) {
      event.locationLon = locationLon ?? null
    }

    if (isPrivate !== undefined) {
      event.isPrivate = Boolean(isPrivate)
    }

    if (rsvpEnabled !== undefined) {
      event.rsvpEnabled = Boolean(rsvpEnabled)
    }

    if (rsvpDeadline !== undefined) {
      event.rsvpDeadline = rsvpDeadline ? new Date(rsvpDeadline) : null
    }

    if (features !== undefined) {
      event.features = { ...event.features, ...features }
    }

    const saved = await EventRepository.update(event)
    return saved.toJSON()
  }

  static async inviteToEvent(
    eventId: number,
    inviterClerkId: string,
    inviteeEmail: string,
    inviteeName?: string | null,
    plusOnes: number = 0,
    subEventInvites: { subEventId: number, plusOnes: number }[] = []
  ): Promise<Record<string, unknown>> {
    if (!inviteeEmail || !inviteeEmail.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    const normalizedEmail = inviteeEmail.trim().toLowerCase()

    // Allow owner or co-organizer to invite
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, inviterClerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to invite to this event' })
    }

    const existing = await EventInvitationRepository.findByEventIdAndEmail(eventId, normalizedEmail)
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'This person is already invited' })
    }

    const invitation = new EventInvitation({
      id: null,
      eventId,
      inviteeEmail: normalizedEmail,
      inviteeName: inviteeName || null,
      inviterClerkId,
      status: 'pending',
      plusOnes,
      accessToken: crypto.randomBytes(16).toString('hex'),
      invitedById: null,
      invitedByName: null,
      subEventInvites,
      plusOneInvites: [],
      createdAt: new Date(),
    })

    const saved = await EventInvitationRepository.create(invitation)
    return saved.toJSON()
  }

  static async addPlusOneInvite(
    accessToken: string,
    plusOneName: string,
    plusOneEmail: string,
  ): Promise<Record<string, unknown>> {
    if (!plusOneEmail || !plusOneEmail.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }
    if (!plusOneName || !plusOneName.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Name is required' })
    }

    const parentInvitation = await EventInvitationRepository.findByAccessToken(accessToken)
    if (!parentInvitation) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
    }

    if (parentInvitation.remainingPlusOnes <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'No plus-one slots remaining' })
    }

    const normalizedEmail = plusOneEmail.trim().toLowerCase()

    const existing = await EventInvitationRepository.findByEventIdAndEmail(parentInvitation.eventId, normalizedEmail)
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'This person is already invited' })
    }

    const plusOneInvitation = new EventInvitation({
      id: null,
      eventId: parentInvitation.eventId,
      inviteeEmail: normalizedEmail,
      inviteeName: plusOneName.trim(),
      inviterClerkId: parentInvitation.inviterClerkId,
      status: 'pending',
      plusOnes: 0,
      accessToken: crypto.randomBytes(16).toString('hex'),
      invitedById: parseInt(parentInvitation.id!),
      invitedByName: parentInvitation.inviteeName,
      subEventInvites: parentInvitation.subEventInvites,
      plusOneInvites: [],
      createdAt: new Date(),
    })

    const saved = await EventInvitationRepository.create(plusOneInvitation)
    return saved.toJSON()
  }

  static async getEventGuests(eventId: number, clerkId: string): Promise<{
    guests: Record<string, unknown>[]
    stats: { total: number, accepted: number, declined: number, pending: number }
  }> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to view guests' })
    }

    // Get primary guests only (not plus-ones) — plus-ones are nested in plusOneInvites
    const primaryInvitations = await EventInvitationRepository.findPrimaryByEventId(eventId)
    // Get all invitations for stats
    const allInvitations = await EventInvitationRepository.findByEventId(eventId)

    const guests = primaryInvitations.map((inv) => inv.toJSON())
    const accepted = allInvitations.filter((inv) => inv.isAccepted).length
    const declined = allInvitations.filter((inv) => inv.isDeclined).length
    const pending = allInvitations.filter((inv) => inv.isPending).length

    return {
      guests,
      stats: { total: allInvitations.length, accepted, declined, pending },
    }
  }

  static async updateGuest(
    eventId: number,
    invitationId: number,
    clerkId: string,
    data: { inviteeName?: string | null, plusOnes?: number, subEventInvites?: { subEventId: number, plusOnes: number }[] }
  ): Promise<Record<string, unknown>> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to edit guests' })
    }

    const updated = await EventInvitationRepository.update(invitationId, data)
    return updated.toJSON()
  }

  static async removeGuest(eventId: number, invitationId: number, clerkId: string): Promise<{ success: boolean }> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to remove guests' })
    }

    await EventInvitationRepository.delete(invitationId)
    return { success: true }
  }

  static async getPublicEvent(shareToken: string): Promise<Record<string, unknown>> {
    const event = await EventRepository.findByShareToken(shareToken)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    // Return public-safe data only
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      eventDate: event.eventDate,
      eventEndDate: event.eventEndDate,
      location: event.location,
      locationLat: event.locationLat,
      locationLon: event.locationLon,
      coverImageUrl: event.coverImageUrl,
      features: event.features,
    }
  }

  static async getInviteEvent(accessToken: string): Promise<Record<string, unknown>> {
    const invitation = await EventInvitationRepository.findByAccessToken(accessToken)
    if (!invitation) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
    }

    const event = await EventRepository.findById(invitation.eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    // Get sub-events the guest is invited to
    const allSubEvents = await SubEventRepository.findByEventId(event.id)
    const invitedSubEventIds = invitation.subEventInvites.map((s) => s.subEventId)
    const subEvents = invitedSubEventIds.length > 0
      ? allSubEvents.filter((se) => invitedSubEventIds.includes(parseInt(se.id)))
      : allSubEvents

    // Get guest's existing sub-event RSVPs
    const subEventRsvps = await SubEventRsvpRepository.findByEventIdAndEmail(event.id!, invitation.inviteeEmail)
    const subEventRsvpMap: Record<string, string> = {}
    for (const rsvp of subEventRsvps) {
      subEventRsvpMap[rsvp.subEventId] = rsvp.status
    }

    return {
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        eventDate: event.eventDate,
        eventEndDate: event.eventEndDate,
        location: event.location,
        locationLat: event.locationLat,
        locationLon: event.locationLon,
        coverImageUrl: event.coverImageUrl,
        features: event.features,
        rsvpEnabled: event.rsvpEnabled,
        rsvpDeadline: event.rsvpDeadline,
      },
      invitation: invitation.toJSON(),
      subEvents: subEvents.map((se) => se.toJSON()),
      subEventRsvps: subEventRsvpMap,
    }
  }

  static async rsvpByToken(accessToken: string, status: string): Promise<Record<string, unknown>> {
    if (!['accepted', 'declined'].includes(status)) {
      throw createError({ statusCode: 400, statusMessage: 'Status must be accepted or declined' })
    }

    const invitation = await EventInvitationRepository.findByAccessToken(accessToken)
    if (!invitation) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
    }

    const event = await EventRepository.findById(invitation.eventId)
    if (event) {
      if (!event.rsvpEnabled) {
        throw createError({ statusCode: 403, statusMessage: 'RSVP is disabled for this event' })
      }
      if (event.rsvpDeadline && new Date() > new Date(event.rsvpDeadline)) {
        throw createError({ statusCode: 400, statusMessage: 'RSVP deadline has passed' })
      }
    }

    const updated = await EventInvitationRepository.update(parseInt(invitation.id!), { status })
    return updated.toJSON()
  }

  static async archiveEvent(eventId: number, clerkId: string): Promise<{ success: boolean }> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the owner can archive this event' })
    }

    await EventRepository.archive(eventId)
    return { success: true }
  }

  static async restoreEvent(eventId: number, clerkId: string): Promise<{ success: boolean }> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the owner can restore this event' })
    }

    await EventRepository.restore(eventId)
    return { success: true }
  }

  static async duplicateEvent(eventId: number, clerkId: string): Promise<Record<string, unknown>> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the owner can duplicate this event' })
    }

    const newEvent = new Event({
      title: event.title + ' (copy)',
      description: event.description,
      eventType: event.eventType,
      location: event.location,
      locationLat: event.locationLat,
      locationLon: event.locationLon,
      isPrivate: event.isPrivate,
      shareToken: crypto.randomBytes(16).toString('hex'),
      tier: event.tier,
      features: event.features,
      ownerClerkId: clerkId,
    })

    const saved = await EventRepository.create(newEvent)

    // Seed owner member
    const ownerMember = new EventMember({
      eventId: saved.id,
      userClerkId: clerkId,
      role: 'owner',
    })
    await EventMemberRepository.create(ownerMember)

    // Duplicate sub-events
    const subEvents = await SubEventRepository.findByEventId(eventId)
    if (subEvents.length > 0) {
      await SubEventRepository.bulkCreate(
        subEvents.map((se) => ({
          eventId: saved.id,
          title: se.title,
          description: se.description,
          location: se.location,
          locationLat: se.locationLat,
          locationLon: se.locationLon,
          sortOrder: se.sortOrder,
        }))
      )
    }

    // Duplicate timeline items (without times)
    const timelineItems = await TimelineItemRepository.findByEventId(eventId)
    if (timelineItems.length > 0) {
      await TimelineItemRepository.bulkCreate(
        timelineItems.map((item: { title: string, description: string | null, location: string | null, startTime: Date | null, endTime: Date | null, sortOrder: number }) => ({
          eventId: saved.id,
          title: item.title,
          description: item.description,
          location: item.location,
          startTime: item.startTime,
          endTime: item.endTime,
          sortOrder: item.sortOrder,
        }))
      )
    }

    return saved.toJSON()
  }

  static async uploadCoverImage(eventId: number, clerkId: string, buffer: Buffer, contentType: string): Promise<{ coverImageUrl: string }> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to edit this event' })
    }

    // Delete old image if exists
    if (event.coverImageKey) {
      await deleteImage(event.coverImageKey).catch(() => {})
    }

    const { key, url } = await uploadImage(buffer, contentType, `events/${eventId}`)
    event.coverImageUrl = url
    event.coverImageKey = key

    const saved = await EventRepository.update(event)
    return { coverImageUrl: saved.coverImageUrl }
  }

  static async deleteCoverImage(eventId: number, clerkId: string): Promise<{ coverImageUrl: null }> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to edit this event' })
    }

    if (event.coverImageKey) {
      await deleteImage(event.coverImageKey).catch(() => {})
    }

    event.coverImageUrl = null
    event.coverImageKey = null

    const saved = await EventRepository.update(event)
    return { coverImageUrl: null }
  }

  // --- Email invitation methods ---

  static async sendInviteEmail(eventId: number, invitationId: number, clerkId: string): Promise<Record<string, unknown>> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission' })
    }

    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const invitation = await EventInvitationRepository.findById(invitationId)
    if (!invitation || Number(invitation.eventId) !== eventId) {
      throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }

    const config = useRuntimeConfig()
    const appUrl = config.public.appUrl as string
    const inviteLink = `${appUrl}/invite/${invitation.accessToken}`

    const html = renderInviteEmail({
      eventTitle: event.title,
      eventDate: event.eventDate ? String(event.eventDate) : null,
      eventLocation: event.location,
      coverImageUrl: event.coverImageUrl,
      inviteeName: invitation.inviteeName,
      inviteLink,
    })

    await sendEmail(
      invitation.inviteeEmail,
      `You're invited to ${event.title}`,
      html,
    )

    await EventInvitationRepository.update(Number(invitation.id), {
      emailSentAt: new Date(),
    })

    return { emailSentAt: new Date() }
  }

  static async sendAllPendingEmails(eventId: number, clerkId: string): Promise<{ sent: number }> {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission' })
    }

    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const invitations = await EventInvitationRepository.findPrimaryByEventId(eventId)
    const unsent = invitations.filter((inv) => !inv.emailSentAt)

    const config = useRuntimeConfig()
    const appUrl = config.public.appUrl as string
    let sent = 0

    for (const invitation of unsent) {
      try {
        const inviteLink = `${appUrl}/invite/${invitation.accessToken}`
        const html = renderInviteEmail({
          eventTitle: event.title,
          eventDate: event.eventDate ? String(event.eventDate) : null,
          eventLocation: event.location,
          coverImageUrl: event.coverImageUrl,
          inviteeName: invitation.inviteeName,
          inviteLink,
        })

        await sendEmail(
          invitation.inviteeEmail,
          `You're invited to ${event.title}`,
          html,
        )

        await EventInvitationRepository.update(Number(invitation.id), {
          emailSentAt: new Date(),
        })
        sent++
      } catch {
        // Skip failed sends, continue with others
      }
    }

    return { sent }
  }
}
