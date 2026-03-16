import DatePoll from '../entities/DatePoll'
import DatePollRepository from '../repositories/datePollRepository'
import DatePollOptionRepository from '../repositories/datePollOptionRepository'
import DatePollVoteRepository from '../repositories/datePollVoteRepository'
import { DatePollVoteStatus } from '../entities/DatePollVote'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'

interface DateOptionInput {
  date: string | Date
  startTime?: string | Date | null
  endTime?: string | Date | null
}

interface VoteInput {
  optionId: string
  status: DatePollVoteStatus
}

export default class DatePollController {
  static async #verifyEdit(eventId: number, clerkId: string): Promise<void> {
    const event = await EventRepository.findById(eventId)
    if (!event) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

    if (!event.features.datePolling) {
      throw createError({ statusCode: 403, statusMessage: 'Date polling requires a Standard or Pro plan' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to edit this event' })
    }
  }

  static async #verifyInvited(eventId: number, email: string): Promise<void> {
    const event = await EventRepository.findById(eventId)
    if (!event) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

    const invitation = await EventInvitationRepository.findByEventIdAndEmail(eventId, email.toLowerCase())
    if (!invitation) {
      throw createError({ statusCode: 403, statusMessage: 'You are not invited to this event' })
    }
  }

  // ── Organizer ─────────────────────────────────────────────────

  static async getPoll(eventId: number, clerkId: string): Promise<Record<string, unknown> | null> {
    await this.#verifyEdit(eventId, clerkId)
    const poll = await DatePollRepository.findByEventId(eventId)
    return poll ? this.#serializePoll(poll) : null
  }

  static async createPoll(eventId: number, clerkId: string, options: DateOptionInput[]): Promise<Record<string, unknown>> {
    await this.#verifyEdit(eventId, clerkId)

    const existing = await DatePollRepository.findByEventId(eventId)
    if (existing) throw createError({ statusCode: 409, statusMessage: 'A date poll already exists for this event' })

    const poll = await DatePollRepository.create(eventId)

    if (Array.isArray(options) && options.length > 0) {
      await DatePollOptionRepository.bulkCreate(
        options.map((o, i) => ({
          datePollId: poll.id!,
          date: o.date,
          startTime: o.startTime || null,
          endTime: o.endTime || null,
          sortOrder: i,
        }))
      )
    }

    const updated = await DatePollRepository.findByEventId(eventId)
    return this.#serializePoll(updated!)
  }

  static async addOption(eventId: number, clerkId: string, option: DateOptionInput): Promise<Record<string, unknown>> {
    await this.#verifyEdit(eventId, clerkId)

    const poll = await DatePollRepository.findByEventId(eventId)
    if (!poll) throw createError({ statusCode: 404, statusMessage: 'No date poll found for this event' })
    if (!poll.isActive) throw createError({ statusCode: 400, statusMessage: 'This poll is closed' })

    if (!option.date) throw createError({ statusCode: 400, statusMessage: 'Date is required' })

    const sortOrder = poll.options.length
    await DatePollOptionRepository.create({
      datePollId: poll.id!,
      date: option.date,
      startTime: option.startTime || null,
      endTime: option.endTime || null,
      sortOrder,
    })

    const updated = await DatePollRepository.findByEventId(eventId)
    return this.#serializePoll(updated!)
  }

  static async removeOption(eventId: number, clerkId: string, optionId: number): Promise<Record<string, unknown>> {
    await this.#verifyEdit(eventId, clerkId)

    const poll = await DatePollRepository.findByEventId(eventId)
    if (!poll) throw createError({ statusCode: 404, statusMessage: 'No date poll found for this event' })

    const option = poll.options.find(o => String(o.id) === String(optionId))
    if (!option) throw createError({ statusCode: 404, statusMessage: 'Option not found' })

    await DatePollOptionRepository.delete(optionId)

    const updated = await DatePollRepository.findByEventId(eventId)
    return this.#serializePoll(updated!)
  }

  static async closePoll(eventId: number, clerkId: string): Promise<Record<string, unknown>> {
    await this.#verifyEdit(eventId, clerkId)

    const poll = await DatePollRepository.findByEventId(eventId)
    if (!poll) throw createError({ statusCode: 404, statusMessage: 'No date poll found for this event' })

    const updated = await DatePollRepository.setActive(poll.id!, false)
    return this.#serializePoll(updated)
  }

  static async reopenPoll(eventId: number, clerkId: string): Promise<Record<string, unknown>> {
    await this.#verifyEdit(eventId, clerkId)

    const poll = await DatePollRepository.findByEventId(eventId)
    if (!poll) throw createError({ statusCode: 404, statusMessage: 'No date poll found for this event' })

    const updated = await DatePollRepository.setActive(poll.id!, true)
    return this.#serializePoll(updated)
  }

  static async deletePoll(eventId: number, clerkId: string): Promise<void> {
    await this.#verifyEdit(eventId, clerkId)

    const poll = await DatePollRepository.findByEventId(eventId)
    if (!poll) throw createError({ statusCode: 404, statusMessage: 'No date poll found for this event' })

    await DatePollRepository.delete(poll.id!)
  }

  static async setOfficialDate(eventId: number, clerkId: string, optionId: number): Promise<Record<string, unknown>> {
    await this.#verifyEdit(eventId, clerkId)

    const poll = await DatePollRepository.findByEventId(eventId)
    if (!poll) throw createError({ statusCode: 404, statusMessage: 'No date poll found for this event' })

    const option = poll.options.find(o => String(o.id) === String(optionId))
    if (!option) throw createError({ statusCode: 404, statusMessage: 'Option not found' })

    const event = await EventRepository.findById(eventId)
    if (!event) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

    event.eventDate = option.date
    event.eventEndDate = option.endTime || null
    await EventRepository.update(event)

    // Close the poll
    await DatePollRepository.setActive(poll.id!, false)

    return { eventDate: option.date, eventEndDate: option.endTime || null }
  }

  // ── Guest ─────────────────────────────────────────────────────

  static async getPublicPoll(eventId: number, email?: string): Promise<Record<string, unknown> | null> {
    const event = await EventRepository.findById(eventId)
    if (!event) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

    const poll = await DatePollRepository.findByEventId(eventId)
    if (!poll) return null

    const ownVotes = email
      ? await DatePollVoteRepository.findByPollIdAndEmail(poll.id!, email.toLowerCase())
      : []

    const ownVoteMap: Record<string, string> = {}
    for (const vote of ownVotes) {
      ownVoteMap[vote.datePollOptionId] = vote.status
    }

    return {
      id: poll.id,
      eventId: poll.eventId,
      isActive: poll.isActive,
      options: poll.options.map(o => ({
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
    }
  }

  static async submitVotes(
    eventId: number,
    voterEmail: string,
    voterName: string | null,
    votes: VoteInput[],
  ): Promise<Record<string, unknown>> {
    if (!voterEmail || !voterEmail.includes('@')) {
      throw createError({ statusCode: 400, statusMessage: 'A valid email address is required' })
    }

    await this.#verifyInvited(eventId, voterEmail)

    const poll = await DatePollRepository.findByEventId(eventId)
    if (!poll) throw createError({ statusCode: 404, statusMessage: 'No date poll found for this event' })
    if (!poll.isActive) throw createError({ statusCode: 400, statusMessage: 'This poll is closed' })

    const validStatuses: DatePollVoteStatus[] = ['yes', 'maybe', 'no']
    const optionIds = poll.options.map(o => String(o.id))

    for (const vote of votes) {
      if (!optionIds.includes(String(vote.optionId))) {
        throw createError({ statusCode: 400, statusMessage: `Invalid option ID: ${vote.optionId}` })
      }
      if (!validStatuses.includes(vote.status)) {
        throw createError({ statusCode: 400, statusMessage: `Invalid vote status: ${vote.status}` })
      }
      await DatePollVoteRepository.upsert(vote.optionId, voterEmail.toLowerCase(), vote.status, voterName)
    }

    const updated = await DatePollRepository.findByEventId(eventId)
    return this.#serializePublicPoll(updated!, voterEmail.toLowerCase())
  }

  // ── Helpers ───────────────────────────────────────────────────

  static #serializePoll(poll: DatePoll): Record<string, unknown> {
    const bestOption = poll.bestOption
    return {
      id: poll.id,
      eventId: poll.eventId,
      isActive: poll.isActive,
      createdAt: poll.createdAt,
      bestOptionId: bestOption?.id || null,
      options: poll.options.map(o => ({
        id: o.id,
        date: o.date,
        startTime: o.startTime,
        endTime: o.endTime,
        sortOrder: o.sortOrder,
        yesCount: o.yesCount,
        maybeCount: o.maybeCount,
        noCount: o.noCount,
        score: o.score,
        totalVotes: o.votes.length,
        voters: o.votes.map(v => ({
          email: v.voterEmail,
          name: v.voterName,
          status: v.status,
        })),
      })),
    }
  }

  static #serializePublicPoll(poll: DatePoll, voterEmail: string): Record<string, unknown> {
    const ownVoteMap: Record<string, string> = {}
    for (const opt of poll.options) {
      const mine = opt.votes.find(v => v.voterEmail === voterEmail)
      if (mine) ownVoteMap[String(opt.id)] = mine.status
    }

    return {
      id: poll.id,
      isActive: poll.isActive,
      options: poll.options.map(o => ({
        id: o.id,
        date: o.date,
        startTime: o.startTime,
        endTime: o.endTime,
        yesCount: o.yesCount,
        maybeCount: o.maybeCount,
        noCount: o.noCount,
        totalVotes: o.votes.length,
        ownVote: ownVoteMap[String(o.id)] || null,
      })),
    }
  }
}
