export interface NotificationData {
  id: number | null
  userClerkId: string
  eventId: number | null
  type: string
  title: string
  body: string
  linkUrl: string | null
  metadata: Record<string, unknown> | null
  isRead: boolean
  createdAt: Date | string
}

export interface NotificationJSON {
  id?: number | null
  userClerkId?: string
  user_clerk_id?: string
  eventId?: number | null
  event_id?: number | null
  type?: string
  title?: string
  body?: string
  linkUrl?: string | null
  link_url?: string | null
  metadata?: Record<string, unknown> | null
  isRead?: boolean
  is_read?: boolean
  createdAt?: Date | string
  created_at?: Date | string
}

export default class Notification {
  id: number | null
  userClerkId: string
  eventId: number | null
  type: string
  title: string
  body: string
  linkUrl: string | null
  metadata: Record<string, unknown> | null
  isRead: boolean
  createdAt: Date | string

  constructor(data: NotificationData) {
    this.id = data.id || null
    this.userClerkId = data.userClerkId
    this.eventId = data.eventId || null
    this.type = data.type
    this.title = data.title
    this.body = data.body
    this.linkUrl = data.linkUrl || null
    this.metadata = data.metadata || null
    this.isRead = data.isRead ?? false
    this.createdAt = data.createdAt || new Date()
  }

  static fromJSON(data: NotificationJSON): Notification {
    return new Notification({
      id: data.id ?? null,
      userClerkId: (data.userClerkId || data.user_clerk_id)!,
      eventId: data.eventId ?? data.event_id ?? null,
      type: data.type || '',
      title: data.title || '',
      body: data.body || '',
      linkUrl: data.linkUrl ?? data.link_url ?? null,
      metadata: data.metadata || null,
      isRead: data.isRead ?? data.is_read ?? false,
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): NotificationData {
    return {
      id: this.id,
      userClerkId: this.userClerkId,
      eventId: this.eventId,
      type: this.type,
      title: this.title,
      body: this.body,
      linkUrl: this.linkUrl,
      metadata: this.metadata,
      isRead: this.isRead,
      createdAt: this.createdAt,
    }
  }
}
