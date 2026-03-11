import Event from '../entities/Event'
import EventInvitation from '../entities/EventInvitation'
import EventRepository from '../repositories/eventRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import SubscriptionController from './subscriptionController'
import { getFeaturesForTier } from '../utils/tierFeatures'

export default class EventController {
  static async listUserEvents(clerkId, email) {
    const ownedEvents = await EventRepository.findByOwner(clerkId)
    const invitedResults = await EventRepository.findByInviteeEmail(email.toLowerCase())

    const owned = await Promise.all(
      ownedEvents.map(async (event) => {
        const invitationCount = await EventRepository.getInvitationCount(event.id)
        return { ...event.toJSON(), invitationCount }
      })
    )

    const invited = invitedResults.map(({ event, status }) => ({
      ...event.toJSON(),
      status,
    }))

    return { owned, invited }
  }

  static async createEvent(clerkId, title, requestedTier = 'free') {
    if (!title || !title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    }

    const { tier, requiresPayment, priceCents } = await SubscriptionController.resolveEventTier(clerkId, requestedTier)

    const event = new Event({
      title: title.trim(),
      tier,
      features: getFeaturesForTier(tier),
      ownerClerkId: clerkId,
    })

    const saved = await EventRepository.create(event)
    return { ...saved.toJSON(), requiresPayment, priceCents }
  }

  static async getEvent(eventId, clerkId, email) {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const isOwner = event.ownerClerkId === clerkId
    if (!isOwner) {
      const invitation = await EventInvitationRepository.findByEventIdAndEmail(eventId, email.toLowerCase())
      if (!invitation) {
        throw createError({ statusCode: 403, statusMessage: 'You do not have access to this event' })
      }
    }

    return { ...event.toJSON(), isOwner }
  }

  static async updateEvent(eventId, clerkId, { title, description, features }) {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the owner can edit this event' })
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

    if (features !== undefined) {
      event.features = { ...event.features, ...features }
    }

    const saved = await EventRepository.update(event)
    return saved.toJSON()
  }

  static async inviteToEvent(eventId, inviterClerkId, inviteeEmail) {
    if (!inviteeEmail || !inviteeEmail.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    const normalizedEmail = inviteeEmail.trim().toLowerCase()

    const events = await EventRepository.findByOwner(inviterClerkId)
    const event = events.find((e) => e.id === eventId)
    if (!event) {
      throw createError({ statusCode: 403, statusMessage: 'You can only invite to your own events' })
    }

    const existing = await EventInvitationRepository.findByEventIdAndEmail(eventId, normalizedEmail)
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'This person is already invited' })
    }

    const invitation = new EventInvitation({
      eventId,
      inviteeEmail: normalizedEmail,
      inviterClerkId,
    })

    const saved = await EventInvitationRepository.create(invitation)
    return saved.toJSON()
  }
}
