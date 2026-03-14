export interface TimelineItemData {
  id: string | null
  eventId: string
  title: string
  description: string | null
  location: string | null
  startTime: string | Date
  endTime: string | Date | null
  sortOrder: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface TimelineItemJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  title: string
  description?: string | null
  location?: string | null
  startTime?: string | Date
  start_time?: string | Date
  endTime?: string | Date | null
  end_time?: string | Date | null
  sortOrder?: number
  sort_order?: number
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class TimelineItem {
  id: string | null
  eventId: string
  title: string
  description: string | null
  location: string | null
  startTime: string | Date
  endTime: string | Date | null
  sortOrder: number
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, eventId, title, description, location, startTime, endTime, sortOrder, createdAt, updatedAt }: TimelineItemData) {
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

  static fromJSON(data: TimelineItemJSON): TimelineItem {
    return new TimelineItem({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      title: data.title,
      description: data.description ?? null,
      location: data.location ?? null,
      startTime: (data.startTime || data.start_time)!,
      endTime: data.endTime || data.end_time || null,
      sortOrder: data.sortOrder ?? data.sort_order ?? 0,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): TimelineItemData {
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
