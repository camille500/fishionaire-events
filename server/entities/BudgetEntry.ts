export interface BudgetEntryData {
  id: number | null
  eventId: number
  description: string
  amountCents: number
  currency: string
  category: string
  paidAt: Date | string
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface BudgetEntryJSON {
  id?: number | null
  eventId?: number
  event_id?: number
  description?: string
  amountCents?: number
  amount_cents?: number
  currency?: string
  category?: string
  paidAt?: Date | string
  paid_at?: Date | string
  notes?: string | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class BudgetEntry {
  id: number | null
  eventId: number
  description: string
  amountCents: number
  currency: string
  category: string
  paidAt: Date | string
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor(data: BudgetEntryData) {
    this.id = data.id || null
    this.eventId = data.eventId
    this.description = data.description
    this.amountCents = data.amountCents
    this.currency = data.currency || 'EUR'
    this.category = data.category
    this.paidAt = data.paidAt || new Date()
    this.notes = data.notes || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: BudgetEntryJSON): BudgetEntry {
    return new BudgetEntry({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      description: data.description || '',
      amountCents: (data.amountCents ?? data.amount_cents)!,
      currency: data.currency || 'EUR',
      category: data.category || 'other',
      paidAt: data.paidAt || data.paid_at || new Date(),
      notes: data.notes ?? null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): BudgetEntryData {
    return {
      id: this.id,
      eventId: this.eventId,
      description: this.description,
      amountCents: this.amountCents,
      currency: this.currency,
      category: this.category,
      paidAt: this.paidAt,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
