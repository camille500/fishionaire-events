export default class Event {
  constructor({ id, title, ownerClerkId, createdAt, updatedAt }) {
    this.id = id || null
    this.title = title
    this.ownerClerkId = ownerClerkId
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data) {
    return new Event({
      id: data.id,
      title: data.title,
      ownerClerkId: data.ownerClerkId || data.owner_clerk_id,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    })
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      ownerClerkId: this.ownerClerkId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
