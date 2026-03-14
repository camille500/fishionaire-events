export default class SubEvent {
  constructor({ id, eventId, title, description, startTime, endTime, location, sortOrder, createdAt, updatedAt }) {
    this.id = id || null
    this.eventId = eventId
    this.title = title
    this.description = description || null
    this.startTime = startTime || null
    this.endTime = endTime || null
    this.location = location || null
    this.sortOrder = sortOrder ?? 0
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data) {
    return new SubEvent({
      id: data.id,
      eventId: data.eventId || data.event_id,
      title: data.title,
      description: data.description,
      startTime: data.startTime || data.start_time,
      endTime: data.endTime || data.end_time,
      location: data.location,
      sortOrder: data.sortOrder ?? data.sort_order ?? 0,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    })
  }

  toJSON() {
    return {
      id: this.id,
      eventId: this.eventId,
      title: this.title,
      description: this.description,
      startTime: this.startTime,
      endTime: this.endTime,
      location: this.location,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
