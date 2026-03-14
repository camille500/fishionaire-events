export default class EventView {
  constructor({ id, eventId, viewerIp, userAgent, clerkId, createdAt }) {
    this.id = id || null
    this.eventId = eventId
    this.viewerIp = viewerIp || null
    this.userAgent = userAgent || null
    this.clerkId = clerkId || null
    this.createdAt = createdAt || new Date()
  }

  static fromJSON(data) {
    return new EventView({
      id: data.id,
      eventId: data.eventId || data.event_id,
      viewerIp: data.viewerIp || data.viewer_ip,
      userAgent: data.userAgent || data.user_agent,
      clerkId: data.clerkId || data.clerk_id,
      createdAt: data.createdAt || data.created_at,
    })
  }

  toJSON() {
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
