import BudgetEntry from '../entities/BudgetEntry'
import BudgetEntryRepository from '../repositories/budgetEntryRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import ActivityLogController from './activityLogController'

export default class BudgetController {
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

  static #checkBudgetFeature(event: any) {
    if (!event.features?.budgetTracker) {
      throw createError({ statusCode: 403, statusMessage: 'Budget tracker is not available for this event tier' })
    }
  }

  static async listEntries(eventId: number, clerkId: string) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkBudgetFeature(event)
    const entries = await BudgetEntryRepository.findByEventId(eventId)
    return entries.map((e) => e.toJSON())
  }

  static async createEntry(eventId: number, clerkId: string, params: {
    description: string
    amountCents: number
    currency?: string
    category: string
    paidAt?: string
    notes?: string
  }) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkBudgetFeature(event)

    if (!params.description?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Description is required' })
    }
    if (!params.amountCents || params.amountCents <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Amount must be greater than zero' })
    }
    if (!params.category?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Category is required' })
    }

    const entry = new BudgetEntry({
      id: null,
      eventId,
      description: params.description.trim(),
      amountCents: params.amountCents,
      currency: params.currency || 'EUR',
      category: params.category.trim(),
      paidAt: params.paidAt ? new Date(params.paidAt) : new Date(),
      notes: params.notes?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const saved = await BudgetEntryRepository.create(entry)

    ActivityLogController.log(eventId, 'budget_expense', params.description.trim(), clerkId, {
      amountCents: params.amountCents,
      category: params.category,
    })

    return saved.toJSON()
  }

  static async updateEntry(entryId: number, clerkId: string, params: {
    description?: string
    amountCents?: number
    currency?: string
    category?: string
    paidAt?: string
    notes?: string
  }) {
    const entry = await BudgetEntryRepository.findById(entryId)
    if (!entry) {
      throw createError({ statusCode: 404, statusMessage: 'Budget entry not found' })
    }

    const event = await this.#verifyOrganizerAccess(entry.eventId, clerkId)
    this.#checkBudgetFeature(event)

    if (params.description !== undefined) entry.description = params.description.trim()
    if (params.amountCents !== undefined) entry.amountCents = params.amountCents
    if (params.currency !== undefined) entry.currency = params.currency
    if (params.category !== undefined) entry.category = params.category.trim()
    if (params.paidAt !== undefined) entry.paidAt = new Date(params.paidAt)
    if (params.notes !== undefined) entry.notes = params.notes?.trim() || null

    const updated = await BudgetEntryRepository.update(entry)
    return updated.toJSON()
  }

  static async deleteEntry(entryId: number, clerkId: string): Promise<void> {
    const entry = await BudgetEntryRepository.findById(entryId)
    if (!entry) {
      throw createError({ statusCode: 404, statusMessage: 'Budget entry not found' })
    }

    await this.#verifyOrganizerAccess(entry.eventId, clerkId)
    await BudgetEntryRepository.delete(entryId)
  }

  static async getStats(eventId: number, clerkId: string) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkBudgetFeature(event)

    const stats = await BudgetEntryRepository.getStatsForEvent(eventId)
    const budgetTargetCents = event.budgetTargetCents ?? null
    const remainingCents = budgetTargetCents !== null
      ? budgetTargetCents - stats.totalSpentCents
      : null

    return {
      ...stats,
      budgetTargetCents,
      budgetCurrency: event.budgetCurrency || 'EUR',
      remainingCents,
    }
  }

  static async updateBudgetTarget(eventId: number, clerkId: string, targetCents: number | null, currency?: string) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkBudgetFeature(event)

    event.budgetTargetCents = targetCents
    if (currency) event.budgetCurrency = currency
    await EventRepository.update(event)

    return { budgetTargetCents: targetCents, budgetCurrency: event.budgetCurrency }
  }
}
