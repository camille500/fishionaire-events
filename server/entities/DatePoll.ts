import type DatePollOption from './DatePollOption'
import { DatePollOptionJSON } from './DatePollOption'
import DatePollOptionEntity from './DatePollOption'

export interface DatePollData {
  id: string | null
  eventId: string
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  options?: DatePollOption[]
}

export interface DatePollJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  isActive?: boolean
  is_active?: boolean
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
  options?: DatePollOptionJSON[]
}

export default class DatePoll {
  id: string | null
  eventId: string
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  options: DatePollOption[]

  constructor({ id, eventId, isActive, createdAt, updatedAt, options }: DatePollData) {
    this.id = id || null
    this.eventId = eventId
    this.isActive = isActive ?? true
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    this.options = options || []
  }

  get bestOption(): DatePollOption | null {
    if (!this.options.length) return null
    return this.options.reduce((best, opt) => opt.score > best.score ? opt : best, this.options[0])
  }

  static fromJSON(data: DatePollJSON): DatePoll {
    return new DatePoll({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      isActive: data.isActive ?? data.is_active ?? true,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
      options: (data.options || []).map(o => DatePollOptionEntity.fromJSON(o)),
    })
  }

  toJSON(): DatePollData {
    return {
      id: this.id,
      eventId: this.eventId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      options: this.options,
    }
  }
}
