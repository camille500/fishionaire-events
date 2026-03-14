export default class SubEventRsvp {
  constructor({ id, subEventId, guestEmail, status, createdAt, updatedAt }) {
    this.id = id || null
    this.subEventId = subEventId
    this.guestEmail = guestEmail
    this.status = status || 'pending'
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data) {
    return new SubEventRsvp({
      id: data.id,
      subEventId: data.subEventId || data.sub_event_id,
      guestEmail: data.guestEmail || data.guest_email,
      status: data.status,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    })
  }

  toJSON() {
    return {
      id: this.id,
      subEventId: this.subEventId,
      guestEmail: this.guestEmail,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
