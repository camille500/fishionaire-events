export interface EventViewData {
  id: string | null
  eventId: string
  viewerIp: string | null
  userAgent: string | null
  clerkId: string | null
  createdAt: Date | string
}

export interface EventViewJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  viewerIp?: string | null
  viewer_ip?: string | null
  userAgent?: string | null
  user_agent?: string | null
  clerkId?: string | null
  clerk_id?: string | null
  createdAt?: Date | string
  created_at?: Date | string
}

export default class EventView {
  id: string | null
  eventId: string
  viewerIp: string | null
  userAgent: string | null
  clerkId: string | null
  createdAt: Date | string

  constructor({ id, eventId, viewerIp, userAgent, clerkId, createdAt }: EventViewData) {
    this.id = id || null
    this.eventId = eventId
    this.viewerIp = viewerIp || null
    this.userAgent = userAgent || null
    this.clerkId = clerkId || null
    this.createdAt = createdAt || new Date()
  }

  static fromJSON(data: EventViewJSON): EventView {
    return new EventView({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      viewerIp: data.viewerIp || data.viewer_ip || null,
      userAgent: data.userAgent || data.user_agent || null,
      clerkId: data.clerkId || data.clerk_id || null,
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): EventViewData {
    return {
      id: this.id,
      eventId: this.eventId,
      viewerIp: this.viewerIp,
      userAgent: this.userAgent,
      clerkId: this.clerkId,
      createdAt: this.createdAt,
    }
  }
}
