export interface ActivityLogData {
  id: number | null
  eventId: number
  type: string
  actorName: string
  actorEmail: string
  metadata: Record<string, unknown> | null
  createdAt: Date | string
}

export interface ActivityLogJSON {
  id?: number | null
  eventId?: number
  event_id?: number
  type?: string
  actorName?: string
  actor_name?: string
  actorEmail?: string
  actor_email?: string
  metadata?: Record<string, unknown> | null
  createdAt?: Date | string
  created_at?: Date | string
}

export default class ActivityLog {
  id: number | null
  eventId: number
  type: string
  actorName: string
  actorEmail: string
  metadata: Record<string, unknown> | null
  createdAt: Date | string

  constructor(data: ActivityLogData) {
    this.id = data.id || null
    this.eventId = data.eventId
    this.type = data.type
    this.actorName = data.actorName
    this.actorEmail = data.actorEmail
    this.metadata = data.metadata || null
    this.createdAt = data.createdAt || new Date()
  }

  static fromJSON(data: ActivityLogJSON): ActivityLog {
    return new ActivityLog({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      type: data.type || '',
      actorName: (data.actorName || data.actor_name)!,
      actorEmail: (data.actorEmail || data.actor_email)!,
      metadata: data.metadata || null,
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): ActivityLogData {
    return {
      id: this.id,
      eventId: this.eventId,
      type: this.type,
      actorName: this.actorName,
      actorEmail: this.actorEmail,
      metadata: this.metadata,
      createdAt: this.createdAt,
    }
  }
}
