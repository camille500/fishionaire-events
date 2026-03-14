export interface SubEventData {
  id: string | null
  eventId: string
  title: string
  description: string | null
  startTime: string | Date | null
  endTime: string | Date | null
  location: string | null
  sortOrder: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SubEventJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  title: string
  description?: string | null
  startTime?: string | Date | null
  start_time?: string | Date | null
  endTime?: string | Date | null
  end_time?: string | Date | null
  location?: string | null
  sortOrder?: number
  sort_order?: number
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class SubEvent {
  id: string | null
  eventId: string
  title: string
  description: string | null
  startTime: string | Date | null
  endTime: string | Date | null
  location: string | null
  sortOrder: number
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, eventId, title, description, startTime, endTime, location, sortOrder, createdAt, updatedAt }: SubEventData) {
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

  static fromJSON(data: SubEventJSON): SubEvent {
    return new SubEvent({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      title: data.title,
      description: data.description ?? null,
      startTime: data.startTime || data.start_time || null,
      endTime: data.endTime || data.end_time || null,
      location: data.location ?? null,
      sortOrder: data.sortOrder ?? data.sort_order ?? 0,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): SubEventData {
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
