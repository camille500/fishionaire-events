export default class TimelineItem {
  constructor({ id, eventId, title, description, location, startTime, endTime, sortOrder, createdAt, updatedAt }) {
    this.id = id || null
    this.eventId = eventId
    this.title = title
    this.description = description || null
    this.location = location || null
    this.startTime = startTime
    this.endTime = endTime || null
    this.sortOrder = sortOrder ?? 0
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data) {
    return new TimelineItem({
      id: data.id,
      eventId: data.eventId || data.event_id,
      title: data.title,
      description: data.description,
      location: data.location,
      startTime: data.startTime || data.start_time,
      endTime: data.endTime || data.end_time,
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
      location: this.location,
      startTime: this.startTime,
      endTime: this.endTime,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
