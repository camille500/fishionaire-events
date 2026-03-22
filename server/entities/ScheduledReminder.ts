export interface ScheduledReminderData {
  id: number | null
  eventId: number
  type: string
  scheduledFor: Date | string
  sentAt: Date | string | null
  metadata: Record<string, unknown> | null
  createdAt: Date | string
}

export interface ScheduledReminderJSON {
  id?: number | null
  eventId?: number
  event_id?: number
  type?: string
  scheduledFor?: Date | string
  scheduled_for?: Date | string
  sentAt?: Date | string | null
  sent_at?: Date | string | null
  metadata?: Record<string, unknown> | null
  createdAt?: Date | string
  created_at?: Date | string
}

export default class ScheduledReminder {
  id: number | null
  eventId: number
  type: string
  scheduledFor: Date | string
  sentAt: Date | string | null
  metadata: Record<string, unknown> | null
  createdAt: Date | string

  constructor(data: ScheduledReminderData) {
    this.id = data.id || null
    this.eventId = data.eventId
    this.type = data.type
    this.scheduledFor = data.scheduledFor
    this.sentAt = data.sentAt || null
    this.metadata = data.metadata || null
    this.createdAt = data.createdAt || new Date()
  }

  static fromJSON(data: ScheduledReminderJSON): ScheduledReminder {
    return new ScheduledReminder({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      type: data.type || '',
      scheduledFor: (data.scheduledFor || data.scheduled_for)!,
      sentAt: data.sentAt ?? data.sent_at ?? null,
      metadata: data.metadata || null,
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): ScheduledReminderData {
    return {
      id: this.id,
      eventId: this.eventId,
      type: this.type,
      scheduledFor: this.scheduledFor,
      sentAt: this.sentAt,
      metadata: this.metadata,
      createdAt: this.createdAt,
    }
  }
}
