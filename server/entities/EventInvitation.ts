export default class EventInvitation {
  constructor({ id, eventId, inviteeEmail, inviterClerkId, status, createdAt }) {
    this.id = id || null
    this.eventId = eventId
    this.inviteeEmail = inviteeEmail
    this.inviterClerkId = inviterClerkId
    this.status = status || 'pending'
    this.createdAt = createdAt || new Date()
  }

  get isPending() {
    return this.status === 'pending'
  }

  static fromJSON(data) {
    return new EventInvitation({
      id: data.id,
      eventId: data.eventId || data.event_id,
      inviteeEmail: data.inviteeEmail || data.invitee_email,
      inviterClerkId: data.inviterClerkId || data.inviter_clerk_id,
      status: data.status,
      createdAt: data.createdAt || data.created_at,
    })
  }

  toJSON() {
    return {
      id: this.id,
      eventId: this.eventId,
      inviteeEmail: this.inviteeEmail,
      inviterClerkId: this.inviterClerkId,
      status: this.status,
      createdAt: this.createdAt,
    }
  }
}
