import crypto from 'crypto'
import Event from '../entities/Event'
import EventMember from '../entities/EventMember'
import EventPurchase from '../entities/EventPurchase'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import EventPurchaseRepository from '../repositories/eventPurchaseRepository'
import DatePollRepository from '../repositories/datePollRepository'
import SubscriptionRepository from '../repositories/subscriptionRepository'
import SubscriptionController from './subscriptionController'
import { RSVP_PRICE_CENTS, RSVP_GUEST_LIMITS, isTierCoveredBySubscription } from '../utils/tierFeatures'
import { useStripe, getStripeRsvpPriceId } from '../utils/stripe'

type TierName = 'free' | 'standard' | 'pro'

interface CreateRsvpData {
  title: string
  description?: string | null
  coverImageUrl?: string | null
  coverImageKey?: string | null
  rsvpDeadline?: string | null
  showPollResults?: boolean
}

export default class RsvpController {
  static async createStandaloneRsvp(
    clerkId: string,
    data: CreateRsvpData,
  ): Promise<Record<string, unknown>> {
    if (!data.title || !data.title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    }

    // Determine tier and guest limit
    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)
    const subTier = (subscription?.isActive ? subscription.tier : 'free') as TierName
    const guestLimit = RSVP_GUEST_LIMITS[subTier] || 50

    const event = new Event({
      title: data.title.trim(),
      description: data.description || null,
      coverImageUrl: data.coverImageUrl || null,
      coverImageKey: data.coverImageKey || null,
      ownerClerkId: clerkId,
      shareToken: crypto.randomBytes(16).toString('hex'),
      mode: 'rsvp',
      guestLimit,
      tier: subTier === 'free' ? 'standard' : subTier, // RSVP purchase grants standard features
      features: { rsvp: true, datePolling: true },
      rsvpEnabled: true,
      rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline + 'T23:59:59.999Z') : null,
      isPrivate: false,
    })

    const saved = await EventRepository.create(event)

    // Seed owner as EventMember
    const ownerMember = new EventMember({
      eventId: saved.id,
      userClerkId: clerkId,
      role: 'owner',
    })
    await EventMemberRepository.create(ownerMember)

    // Auto-create a date poll
    await DatePollRepository.create(Number(saved.id))

    return saved.toJSON()
  }

  static async listRsvps(clerkId: string): Promise<Record<string, unknown>[]> {
    const rsvps = await EventRepository.findRsvpsByOwner(clerkId)
    const ids = rsvps.map((r) => Number(r.id))
    const counts = await EventRepository.getInvitationCountsByEventIds(ids)

    return rsvps.map((rsvp) => ({
      ...rsvp.toSummaryJSON(),
      guestLimit: rsvp.guestLimit,
      invitationCount: counts[Number(rsvp.id)] || 0,
    }))
  }

  static async getRsvp(rsvpId: number, clerkId: string): Promise<Record<string, unknown>> {
    const event = await EventRepository.findById(rsvpId)
    if (!event || event.mode !== 'rsvp') {
      throw createError({ statusCode: 404, statusMessage: 'RSVP not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(rsvpId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to view this RSVP' })
    }

    const [poll, invitations] = await Promise.all([
      DatePollRepository.findByEventId(rsvpId),
      EventInvitationRepository.findByEventId(String(rsvpId)),
    ])

    const accepted = invitations.filter((i) => i.status === 'accepted').length
    const declined = invitations.filter((i) => i.status === 'declined').length
    const pending = invitations.filter((i) => i.status === 'pending').length

    return {
      ...event.toJSON(),
      poll: poll ? {
        id: poll.id,
        isActive: poll.isActive,
        optionCount: poll.options.length,
      } : null,
      guestStats: {
        total: invitations.length,
        accepted,
        declined,
        pending,
      },
    }
  }

  static async updateRsvp(
    rsvpId: number,
    clerkId: string,
    data: Partial<CreateRsvpData>,
  ): Promise<Record<string, unknown>> {
    const event = await EventRepository.findById(rsvpId)
    if (!event || event.mode !== 'rsvp') {
      throw createError({ statusCode: 404, statusMessage: 'RSVP not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(rsvpId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to edit this RSVP' })
    }

    if (data.title !== undefined) event.title = data.title.trim()
    if (data.description !== undefined) event.description = data.description
    if (data.coverImageUrl !== undefined) event.coverImageUrl = data.coverImageUrl
    if (data.coverImageKey !== undefined) event.coverImageKey = data.coverImageKey
    if (data.rsvpDeadline !== undefined) {
      event.rsvpDeadline = data.rsvpDeadline ? new Date(data.rsvpDeadline + 'T23:59:59.999Z') : null
    }
    if (data.showPollResults !== undefined) event.showPollResults = data.showPollResults

    const saved = await EventRepository.update(event)
    return saved.toJSON()
  }

  static async deleteRsvp(rsvpId: number, clerkId: string): Promise<void> {
    const event = await EventRepository.findById(rsvpId)
    if (!event || event.mode !== 'rsvp') {
      throw createError({ statusCode: 404, statusMessage: 'RSVP not found' })
    }

    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Only the owner can delete this RSVP' })
    }

    await EventRepository.archive(String(rsvpId))
  }

  static async getPublicRsvp(shareToken: string, voterEmail?: string | null): Promise<Record<string, unknown>> {
    const event = await EventRepository.findByShareToken(shareToken)
    if (!event || event.mode !== 'rsvp') {
      throw createError({ statusCode: 404, statusMessage: 'RSVP not found' })
    }

    const poll = await DatePollRepository.findByEventId(Number(event.id))

    // Build own-vote map if email is provided
    const ownVoteMap: Record<string, { status: string, attendFrom?: string | null, attendUntil?: string | null }> = {}
    if (voterEmail && poll) {
      for (const opt of poll.options) {
        const mine = opt.votes.find((v) => v.voterEmail === voterEmail.toLowerCase())
        if (mine) {
          ownVoteMap[String(opt.id)] = {
            status: mine.status,
            attendFrom: mine.attendFrom,
            attendUntil: mine.attendUntil,
          }
        }
      }
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      coverImageUrl: event.coverImageUrl,
      eventDate: event.eventDate,
      rsvpEnabled: event.rsvpEnabled,
      rsvpDeadline: event.rsvpDeadline,
      showPollResults: event.showPollResults,
      themeColor: event.themeColor,
      themeColorSecondary: event.themeColorSecondary,
      poll: poll ? {
        id: poll.id,
        isActive: poll.isActive,
        options: poll.options.map((o) => ({
          id: o.id,
          date: o.date,
          startTime: o.startTime,
          endTime: o.endTime,
          sortOrder: o.sortOrder,
          yesCount: o.yesCount,
          maybeCount: o.maybeCount,
          noCount: o.noCount,
          totalVotes: o.votes.length,
          ownVote: ownVoteMap[String(o.id)] || null,
        })),
      } : null,
    }
  }

  static async createRsvpCheckout(
    clerkId: string,
    email: string,
  ): Promise<{ url: string }> {
    // Check if user already has a subscription that covers standalone RSVP
    const subscription = await SubscriptionRepository.findByUserClerkId(clerkId)
    const currentTier = (subscription?.isActive ? subscription.tier : 'free') as TierName

    if (isTierCoveredBySubscription(currentTier, 'standard')) {
      throw createError({ statusCode: 400, statusMessage: 'Your subscription already includes standalone RSVPs' })
    }

    const stripe = useStripe()
    const customerId = await SubscriptionController._findOrCreateCustomer(clerkId, email)

    const config = useRuntimeConfig()
    const priceId = getStripeRsvpPriceId()

    if (!priceId) {
      // Fallback: create inline price
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Standalone RSVP',
              description: 'Create a standalone date poll & RSVP — invite up to 50 guests',
            },
            unit_amount: RSVP_PRICE_CENTS,
          },
          quantity: 1,
        }],
        success_url: `${config.public.appUrl}/dashboard/rsvps/create?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.public.appUrl}/dashboard/rsvps`,
        metadata: {
          clerkId,
          type: 'rsvp',
        },
      })
      return { url: session.url }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.public.appUrl}/dashboard/rsvps/create?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.public.appUrl}/dashboard/rsvps`,
      metadata: {
        clerkId,
        type: 'rsvp',
      },
    })

    return { url: session.url }
  }
}
