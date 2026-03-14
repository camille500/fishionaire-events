export default class EventMember {
  constructor({ id, eventId, userClerkId, role, invitedEmail, createdAt, user }) {
    this.id = id || null
    this.eventId = eventId
    this.userClerkId = userClerkId
    this.role = role || 'guest'
    this.invitedEmail = invitedEmail || null
    this.createdAt = createdAt || new Date()
    this.user = user || null
  }

  static fromJSON(data) {
    return new EventMember({
      id: data.id,
      eventId: data.eventId || data.event_id,
      userClerkId: data.userClerkId || data.user_clerk_id,
      role: data.role,
      invitedEmail: data.invitedEmail || data.invited_email,
      createdAt: data.createdAt || data.created_at,
      user: data.user || null,
    })
  }

  toJSON() {
    return {
      id: this.id,
      eventId: this.eventId,
      userClerkId: this.userClerkId,
      role: this.role,
      invitedEmail: this.invitedEmail,
      createdAt: this.createdAt,
      user: this.user ? {
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
      } : null,
    }
  }

  get isOwner() {
    return this.role === 'owner'
  }

  get isCoOrganizer() {
    return this.role === 'co_organizer'
  }

  get canEdit() {
    return this.role === 'owner' || this.role === 'co_organizer'
  }
}
